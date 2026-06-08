# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteHttpToolTest do
  use ExUnit.Case, async: true

  import Mox

  alias LangChain.Function
  alias OpenApiSpex.{Operation, Parameter, Schema}
  alias Trento.AI.{HttpClient, OperationEntry, RemoteHttpTool}

  setup :verify_on_exit!

  defp entry(verb, path, parameters \\ []) do
    %OperationEntry{
      source: :test,
      tool_name: "test_tool",
      display_text: "Test Tool",
      operation: %Operation{
        summary: "test",
        description: "desc",
        parameters: parameters,
        responses: %{}
      },
      verb: verb,
      path: path
    }
  end

  defp context(jwt), do: %{tool_context: %{access_token: jwt}}

  describe "build/2 — function metadata" do
    test "wires tool_name, display_text, description, parameters_schema, function" do
      assert %Function{
               name: "test_tool",
               display_text: "Test Tool",
               description: "test\n\ndesc",
               parameters_schema: %{"type" => "object"},
               function: function
             } = RemoteHttpTool.build(entry(:get, "/x"), "http://wanda")

      assert is_function(function, 2)
    end

    test "falls back to tool_name when display_text is nil" do
      e = %{entry(:get, "/x") | display_text: nil}
      assert %Function{display_text: "test_tool"} = RemoteHttpTool.build(e, "http://wanda")
    end
  end

  describe "dispatch — happy path" do
    test "GET with path placeholder + query param + Bearer header" do
      expect(HttpClient.Mock, :request, fn :get, url, body, headers, _opts ->
        assert url == "http://wanda/api/v1/users/42?limit=10"
        assert body == ""
        assert {"authorization", "Bearer JWT123"} in headers
        assert {"accept", "application/json"} in headers
        refute Enum.any?(headers, fn {k, _} -> k == "content-type" end)

        {:ok, %HTTPoison.Response{status_code: 200, body: ~s({"ok":true})}}
      end)

      e =
        entry(:get, "/api/v1/users/{id}", [
          %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}},
          %Parameter{name: :limit, in: :query, required: false, schema: %Schema{type: :integer}}
        ])

      assert {:ok, ~s({"ok":true})} =
               e
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{"id" => "42", "limit" => 10}, context("JWT123"))
    end

    test "POST body args JSON-encoded with content-type header" do
      expect(HttpClient.Mock, :request, fn :post, url, body, headers, _opts ->
        assert url == "http://wanda/api/v1/groups/g1/start"
        assert {:ok, %{"checks" => ["c1", "c2"]}} = Jason.decode(body)
        assert {"content-type", "application/json"} in headers

        {:ok, %HTTPoison.Response{status_code: 202, body: ~s({"accepted":true})}}
      end)

      e =
        entry(:post, "/api/v1/groups/{group_id}/start", [
          %Parameter{name: :group_id, in: :path, required: true, schema: %Schema{type: :string}}
        ])

      assert {:ok, _} =
               e
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(
                 %{"group_id" => "g1", "checks" => ["c1", "c2"]},
                 context("JWT")
               )
    end
  end

  describe "dispatch — error paths" do
    test "returns tagged error for 4xx" do
      expect(HttpClient.Mock, :request, fn _, _, _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 404, body: ~s({"error":"not found"})}}
      end)

      assert {:error, msg} =
               entry(:get, "/x")
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{}, context("JWT"))

      assert msg =~ "404"
      assert msg =~ "not found"
    end

    test "returns tagged error for 5xx" do
      expect(HttpClient.Mock, :request, fn _, _, _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: "boom"}}
      end)

      assert {:error, "500 boom"} =
               entry(:get, "/x")
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{}, context("JWT"))
    end

    test "returns tool-invocation-failed on transport error" do
      expect(HttpClient.Mock, :request, fn _, _, _, _, _ ->
        {:error, %HTTPoison.Error{reason: :nxdomain}}
      end)

      assert {:error, msg} =
               entry(:get, "/x")
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{}, context("JWT"))

      assert msg =~ "tool invocation failed"
      assert msg =~ "nxdomain"
    end

    test "refuses to dispatch when access_token missing from tool_context" do
      assert {:error, msg} =
               entry(:get, "/x")
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{}, %{tool_context: %{}})

      assert msg =~ "missing access_token"
    end

    test "refuses to dispatch when context has no tool_context at all" do
      assert {:error, msg} =
               entry(:get, "/x")
               |> RemoteHttpTool.build("http://wanda")
               |> Function.execute(%{}, %{scope: nil})

      assert msg =~ "missing access_token"
    end
  end
end

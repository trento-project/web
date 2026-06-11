# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteHttpToolTest do
  use ExUnit.Case, async: false
  use Trento.AI.AICase

  import Mox
  import Trento.Factory

  alias LangChain.Function
  alias OpenApiSpex.{Parameter, Schema}
  alias Trento.AI.RemoteHttpTool
  alias Trento.Support.HttpClient

  setup :verify_on_exit!

  @base_url "http://wanda"

  defp context(jwt, request_origin \\ nil),
    do: %{tool_context: %{access_token: jwt, request_origin: request_origin}}

  describe "build/2 — function metadata" do
    test "wires tool_name, display_text, description, parameters_schema, function" do
      e = build(:operation_entry, verb: :get, path: "/x")
      tool_name = e.tool_name
      display_text = e.display_text

      assert %Function{
               name: ^tool_name,
               display_text: ^display_text,
               parameters_schema: %{"type" => "object"},
               function: function
             } = RemoteHttpTool.build(e, @base_url)

      assert is_function(function, 2)
    end

    test "falls back to tool_name when display_text is nil" do
      e = %{build(:operation_entry, verb: :get, path: "/x") | display_text: nil}
      tool_name = e.tool_name
      assert %Function{display_text: ^tool_name} = RemoteHttpTool.build(e, @base_url)
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
        build(:operation_entry,
          verb: :get,
          path: "/api/v1/users/{id}",
          operation: %OpenApiSpex.Operation{
            parameters: [
              %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}},
              %Parameter{
                name: :limit,
                in: :query,
                required: false,
                schema: %Schema{type: :integer}
              }
            ],
            responses: %{}
          }
        )

      assert {:ok, ~s({"ok":true})} =
               e
               |> RemoteHttpTool.build(@base_url)
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
        build(:operation_entry,
          verb: :post,
          path: "/api/v1/groups/{group_id}/start",
          operation: %OpenApiSpex.Operation{
            parameters: [
              %Parameter{
                name: :group_id,
                in: :path,
                required: true,
                schema: %Schema{type: :string}
              }
            ],
            responses: %{}
          }
        )

      assert {:ok, _} =
               e
               |> RemoteHttpTool.build(@base_url)
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
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build(@base_url)
               |> Function.execute(%{}, context("JWT"))

      assert msg =~ "404"
      assert msg =~ "not found"
    end

    test "returns tagged error for 5xx" do
      expect(HttpClient.Mock, :request, fn _, _, _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: "boom"}}
      end)

      assert {:error, "500 boom"} =
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build(@base_url)
               |> Function.execute(%{}, context("JWT"))
    end

    test "returns tool-invocation-failed on transport error" do
      expect(HttpClient.Mock, :request, fn _, _, _, _, _ ->
        {:error, %HTTPoison.Error{reason: :nxdomain}}
      end)

      assert {:error, msg} =
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build(@base_url)
               |> Function.execute(%{}, context("JWT"))

      assert msg =~ "tool invocation failed"
      assert msg =~ "nxdomain"
    end

    test "refuses to dispatch when access_token missing from tool_context" do
      assert {:error, msg} =
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build(@base_url)
               |> Function.execute(%{}, %{tool_context: %{}})

      assert msg =~ "missing access_token"
    end

    test "refuses to dispatch when context has no tool_context at all" do
      assert {:error, msg} =
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build(@base_url)
               |> Function.execute(%{}, %{scope: nil})

      assert msg =~ "missing access_token"
    end
  end

  describe "dispatch — URL resolution from base_url + request_origin" do
    test "prepends request_origin when base_url is relative" do
      expect(HttpClient.Mock, :request, fn :get, url, _body, _headers, _opts ->
        assert url == "https://trento.example.com/wanda/x"
        {:ok, %HTTPoison.Response{status_code: 200, body: ""}}
      end)

      assert {:ok, _} =
               build(:operation_entry, verb: :get, path: "/x")
               |> RemoteHttpTool.build("/wanda")
               |> Function.execute(%{}, context("JWT", "https://trento.example.com"))
    end
  end
end

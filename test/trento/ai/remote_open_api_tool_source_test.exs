# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.RemoteOpenApiToolSourceTest do
  use ExUnit.Case, async: true
  use Trento.AI.AICase

  import Mox

  import ExUnit.CaptureLog

  alias LangChain.Function
  alias Trento.AI.RemoteOpenApiToolSource
  alias Trento.Support.HttpClient

  setup :verify_on_exit!

  defp synthetic_spec do
    %{
      "openapi" => "3.0.0",
      "info" => %{"title" => "Wanda", "version" => "1"},
      "servers" => [%{"url" => "http://wanda"}],
      "paths" => %{
        "/api/v1/groups/{group_id}/checks" => %{
          "get" => %{
            "operationId" => "selectable_checks_default",
            "summary" => "Selectable checks",
            "description" => "List checks for a group.",
            "tags" => ["Catalog", "MCP"],
            "x-ai-tool" => %{
              "name" => "selectable_checks",
              "display_text" => "Selectable Checks"
            },
            "parameters" => [
              %{
                "name" => "group_id",
                "in" => "path",
                "required" => true,
                "schema" => %{"type" => "string", "format" => "uuid"}
              }
            ],
            "responses" => %{"200" => %{"description" => "ok"}}
          }
        },
        "/api/v2/checks/executions" => %{
          "get" => %{
            "operationId" => "list_executions",
            "summary" => "List executions",
            "tags" => ["Checks", "MCP"],
            "parameters" => [],
            "responses" => %{"200" => %{"description" => "ok"}}
          }
        },
        "/api/v2/internal" => %{
          "get" => %{
            "operationId" => "internal_only",
            "summary" => "Internal",
            "tags" => ["Internal"],
            "parameters" => [],
            "responses" => %{"200" => %{"description" => "ok"}}
          }
        },
        "/api/v2/no-op-id" => %{
          "post" => %{
            "summary" => "No op id",
            "tags" => ["MCP"],
            "parameters" => [],
            "responses" => %{"202" => %{"description" => "ok"}}
          }
        }
      }
    }
  end

  defp expect_spec_fetch_ok(spec \\ synthetic_spec()) do
    expect(HttpClient.Mock, :get, fn _url, _headers, _opts ->
      {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(spec)}}
    end)
  end

  defp source_opts(extra \\ []) do
    Keyword.merge(
      [
        name: :wanda_test,
        spec_url: "http://wanda/api/all/openapi"
      ],
      extra
    )
  end

  describe "tools/1 — fallback chain" do
    test "uses x-ai-tool.name and display_text when present" do
      expect_spec_fetch_ok()

      tools = RemoteOpenApiToolSource.tools(source_opts())

      assert tool = Enum.find(tools, &(&1.name == "selectable_checks"))
      assert %Function{display_text: "Selectable Checks"} = tool
      assert tool.description =~ "Selectable checks"
      assert tool.description =~ "List checks for a group."
    end

    test "falls back to operationId + summary when x-ai-tool missing" do
      expect_spec_fetch_ok()

      tools = RemoteOpenApiToolSource.tools(source_opts())

      assert tool = Enum.find(tools, &(&1.name == "list_executions"))
      assert %Function{display_text: "List executions"} = tool
    end

    test "falls back to verb_path when operationId also missing" do
      expect_spec_fetch_ok()

      tools = RemoteOpenApiToolSource.tools(source_opts())

      assert tool = Enum.find(tools, &(&1.name == "post_api_v2_no-op-id"))
      assert %Function{display_text: "No op id"} = tool
    end

    test "filters out operations without the MCP tag" do
      expect_spec_fetch_ok()

      tools = RemoteOpenApiToolSource.tools(source_opts())

      refute Enum.any?(tools, &(&1.name == "internal_only"))
    end
  end

  describe "tools/1 — parameters_schema propagation" do
    test "remote operation parameters surface in the tool's parameters_schema" do
      expect_spec_fetch_ok()

      tools = RemoteOpenApiToolSource.tools(source_opts())

      tool = Enum.find(tools, &(&1.name == "selectable_checks"))

      assert %{
               "type" => "object",
               "properties" => %{"group_id" => %{"type" => "string", "format" => "uuid"}},
               "required" => ["group_id"]
             } = tool.parameters_schema
    end
  end

  describe "tools/1 — failure modes" do
    test "returns [] when spec endpoint returns non-200" do
      expect(HttpClient.Mock, :get, fn _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 503, body: ""}}
      end)

      assert [] = RemoteOpenApiToolSource.tools(source_opts())
    end

    test "returns [] on transport error" do
      expect(HttpClient.Mock, :get, fn _, _, _ ->
        {:error, %HTTPoison.Error{reason: :timeout}}
      end)

      assert [] = RemoteOpenApiToolSource.tools(source_opts())
    end

    test "returns [] on invalid JSON body" do
      expect(HttpClient.Mock, :get, fn _, _, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: "not json"}}
      end)

      assert [] = RemoteOpenApiToolSource.tools(source_opts())
    end
  end

  describe "tools/1 — base_url extraction from servers[0].url" do
    test "returns [] and logs when spec has no servers key" do
      spec = Map.delete(synthetic_spec(), "servers")
      expect_spec_fetch_ok(spec)

      log =
        capture_log(fn ->
          assert [] = RemoteOpenApiToolSource.tools(source_opts())
        end)

      assert log =~ "missing servers[0].url"
    end

    test "returns [] and logs when servers list is empty" do
      spec = Map.put(synthetic_spec(), "servers", [])
      expect_spec_fetch_ok(spec)

      log =
        capture_log(fn ->
          assert [] = RemoteOpenApiToolSource.tools(source_opts())
        end)

      assert log =~ "missing servers[0].url"
    end

    test "returns [] and logs when servers[0].url is nil" do
      spec = Map.put(synthetic_spec(), "servers", [%{"url" => nil}])
      expect_spec_fetch_ok(spec)

      log =
        capture_log(fn ->
          assert [] = RemoteOpenApiToolSource.tools(source_opts())
        end)

      assert log =~ "missing servers[0].url"
    end

    test "extracted base_url is used as dispatch prefix" do
      spec = Map.put(synthetic_spec(), "servers", [%{"url" => "http://elsewhere.example"}])
      expect_spec_fetch_ok(spec)

      expect(HttpClient.Mock, :request, fn :get, url, _body, _headers, _opts ->
        assert String.starts_with?(url, "http://elsewhere.example/")
        {:ok, %HTTPoison.Response{status_code: 200, body: ~s({"ok":true})}}
      end)

      tools = RemoteOpenApiToolSource.tools(source_opts())
      tool = Enum.find(tools, &(&1.name == "selectable_checks"))

      ctx = %{tool_context: %{access_token: "JWT", request_origin: nil}}
      assert {:ok, _} = Function.execute(tool, %{"group_id" => "g1"}, ctx)
    end
  end
end

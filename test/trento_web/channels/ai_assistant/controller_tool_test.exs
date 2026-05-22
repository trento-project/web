# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ControllerToolTest do
  use Trento.DataCase

  import Trento.Factory

  alias LangChain.Function
  alias TrentoWeb.AIAssistant.{ControllerTool, ToolCatalog}
  alias TrentoWeb.AIAssistant.ToolCatalog.Entry
  alias TrentoWeb.V1

  defp host_list_entry do
    %Entry{
      controller: V1.HostController,
      action: :list,
      tool_name: "Host_list",
      display_text: "List hosts"
    }
  end

  defp host_query_metrics_entry do
    %Entry{
      controller: V1.HostController,
      action: :query_metrics,
      tool_name: "Host_query_metrics",
      display_text: "Query Prometheus metrics for a host"
    }
  end

  describe "build/1" do
    test "returns a %LangChain.Function{} with name, display_text, description, parameters_schema, and function" do
      entry = host_list_entry()

      assert %Function{
               name: "Host_list",
               display_text: "List hosts",
               description: description,
               parameters_schema: %{type: "object", properties: properties, required: required},
               function: function
             } = ControllerTool.build(entry)

      assert is_binary(description)
      assert description != ""
      assert is_map(properties)
      assert is_list(required)
      assert is_function(function, 2)
    end

    test "propagates entry.display_text to LangChain.Function.display_text (powers AG-UI label)" do
      entry = host_list_entry()
      assert %Function{display_text: "List hosts"} = ControllerTool.build(entry)
    end

    test "translates path UUID parameters into JSON schema strings with uuid format" do
      entry = host_query_metrics_entry()

      assert %Function{parameters_schema: %{properties: properties, required: required}} =
               ControllerTool.build(entry)

      assert %{type: "string", format: :uuid} = properties["id"]
      assert %{type: "string"} = properties["query"]
      assert "id" in required
      assert "query" in required
      refute "time" in required
    end

    test "covers every catalog entry without crashing" do
      for entry <- ToolCatalog.entries() do
        assert %Function{name: name, display_text: dt} = ControllerTool.build(entry)
        assert is_binary(name)
        assert is_binary(dt)
      end
    end
  end

  describe "invoke/3 — happy path" do
    setup do
      user = insert(:user)
      insert_list(2, :host)
      %{user: user}
    end

    test "calls the controller action and returns its JSON body for HostController.list", %{
      user: user
    } do
      result =
        ControllerTool.invoke(host_list_entry(), %{}, %{scope: %Trento.Users.User{id: user.id}})

      assert is_binary(result)
      assert {:ok, decoded} = Jason.decode(result)
      assert is_list(decoded)
      assert length(decoded) == 2
    end
  end

  describe "invoke/3 — error paths" do
    test "returns \"unauthorized\" when the scope's user_id does not exist" do
      assert ControllerTool.invoke(host_list_entry(), %{}, %{
               scope: %Trento.Users.User{id: 999_999}
             }) == "unauthorized"
    end

    test "returns \"unauthorized\" when the context is missing scope" do
      assert ControllerTool.invoke(host_list_entry(), %{}, %{}) == "unauthorized"
    end
  end
end

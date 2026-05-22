# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ControllerToolTest do
  use Trento.DataCase

  import Trento.Factory

  alias LangChain.Function
  alias TrentoWeb.AIAssistant.{ControllerTool, ToolCatalog}
  alias TrentoWeb.V1

  defp entry_for(controller, action) do
    Enum.find(ToolCatalog.entries(), fn e ->
      e.controller == controller and e.action == action
    end) ||
      flunk("no catalog entry for #{inspect(controller)}.#{action}")
  end

  describe "build/1" do
    test "returns a %LangChain.Function{} with name, display_text, description, parameters_schema, and function" do
      entry = entry_for(V1.HostController, :list)

      assert %Function{
               name: name,
               display_text: display_text,
               description: description,
               parameters_schema: %{type: "object", properties: properties, required: required},
               function: function
             } = ControllerTool.build(entry)

      assert is_binary(name) and name != ""
      assert is_binary(display_text) and display_text != ""
      assert is_binary(description) and description != ""
      assert is_map(properties)
      assert is_list(required)
      assert is_function(function, 2)
    end

    test "propagates entry.display_text to LangChain.Function.display_text (powers AG-UI label)" do
      entry = entry_for(V1.HostController, :list)
      assert %Function{display_text: dt} = ControllerTool.build(entry)
      assert dt == entry.display_text
    end

    test "translates path UUID parameters into JSON schema strings with uuid format" do
      entry = entry_for(V1.HostController, :query_metrics)

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
        ControllerTool.invoke(entry_for(V1.HostController, :list), %{}, %{
          scope: %Trento.Users.User{id: user.id}
        })

      assert is_binary(result)
      assert {:ok, decoded} = Jason.decode(result)
      assert is_list(decoded)
      assert length(decoded) == 2
    end
  end

  describe "invoke/3 — error paths" do
    test "returns \"unauthorized\" when the scope's user_id does not exist" do
      assert ControllerTool.invoke(entry_for(V1.HostController, :list), %{}, %{
               scope: %Trento.Users.User{id: 999_999}
             }) == "unauthorized"
    end

    test "returns \"unauthorized\" when the context is missing scope" do
      assert ControllerTool.invoke(entry_for(V1.HostController, :list), %{}, %{}) ==
               "unauthorized"
    end
  end
end

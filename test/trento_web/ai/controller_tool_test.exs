# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.ControllerToolTest do
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias LangChain.Function
  alias TrentoWeb.AI.{ControllerTool, McpRouteIndex}
  alias TrentoWeb.V1

  defp entry_for({controller, action}) do
    Enum.find(McpRouteIndex.entries(), fn e ->
      e.controller == controller and e.action == action
    end) ||
      flunk("no catalog entry for #{inspect(controller)}.#{action}")
  end

  defp invoke(entry, args, context) do
    entry
    |> ControllerTool.build()
    |> Function.execute(args, context)
  end

  describe "build/1" do
    test "returns a %LangChain.Function{} with name, display_text, description, parameters_schema, and function" do
      entry = entry_for({V1.HostController, :list})

      assert %Function{
               name: name,
               display_text: display_text,
               description: description,
               parameters_schema: %{"type" => "object", "properties" => properties} = schema,
               function: function
             } = ControllerTool.build(entry)

      assert is_binary(name) and name != ""
      assert is_binary(display_text) and display_text != ""
      assert is_binary(description) and description != ""
      assert is_map(properties)
      refute Map.has_key?(schema, "required")
      assert is_function(function, 2)
    end

    test "propagates entry.display_text to LangChain.Function.display_text (powers AG-UI label)" do
      entry = entry_for({V1.HostController, :list})
      assert %Function{display_text: dt} = ControllerTool.build(entry)
      assert dt == entry.display_text
    end

    test "covers every catalog entry without crashing" do
      for entry <- McpRouteIndex.entries() do
        assert %Function{name: name, display_text: dt} = ControllerTool.build(entry)
        assert is_binary(name)
        assert is_binary(dt)
      end
    end

    test "Function.display_text falls back to entry.tool_name when entry.display_text is nil" do
      entry = %McpRouteIndex.Entry{
        controller: TrentoWeb.V1.HostController,
        action: :list,
        tool_name: "synthetic_tool",
        display_text: nil,
        operation: %OpenApiSpex.Operation{responses: %{}},
        verb: :get,
        path: "/synthetic"
      }

      assert %Function{display_text: "synthetic_tool"} = ControllerTool.build(entry)
    end
  end

  describe "build/1 |> Function.execute/3 — happy path" do
    setup do
      user = insert(:user)
      insert_list(2, :host)
      %{user: user}
    end

    test "calls the controller action and returns its JSON body for HostController.list", %{
      user: user
    } do
      assert {:ok, body} =
               {V1.HostController, :list}
               |> entry_for()
               |> invoke(%{}, %{scope: user})

      assert {:ok, decoded} = Jason.decode(body)
      assert is_list(decoded)
      assert length(decoded) == 2
    end
  end

  describe "build/1 |> Function.execute/3 — error paths" do
    test "returns a tool-invocation-failed error when the scoped user does not exist" do
      assert {:error, reason} =
               {V1.HostController, :list}
               |> entry_for()
               |> invoke(%{}, %{scope: %Trento.Users.User{id: 999_999}})

      assert String.starts_with?(reason, "tool invocation failed")
    end

    test "returns a 403 error when the authenticated user lacks the required ability" do
      user = insert(:user)

      assert {:error, reason} =
               {V1.UsersController, :show}
               |> entry_for()
               |> invoke(%{"id" => user.id}, %{scope: user})

      assert String.starts_with?(reason, "403")
    end
  end

  describe "build/1 |> Function.execute/3 — dispatch param routing" do
    setup do
      caller = insert(:user)

      %{id: ability_id} =
        Trento.Repo.get_by!(Trento.Abilities.Ability, name: "all", resource: "all")

      insert(:users_abilities, user_id: caller.id, ability_id: ability_id)
      %{caller: caller}
    end

    test "GET with path placeholder substitutes the id and dispatches to the action", %{
      caller: caller
    } do
      %{id: target_id} = insert(:user)

      assert {:ok, body} =
               {V1.UsersController, :show}
               |> entry_for()
               |> invoke(%{"id" => target_id}, %{scope: caller})

      assert {:ok, decoded} = Jason.decode(body)
      assert decoded["id"] == target_id
    end

    test "GET against a path placeholder with a non-existent id surfaces a 404 (path was substituted)",
         %{caller: caller} do
      assert {:error, reason} =
               {V1.UsersController, :show}
               |> entry_for()
               |> invoke(%{"id" => 999_999}, %{scope: caller})

      assert String.starts_with?(reason, "404")
    end

    test "POST with body args dispatches with body_params populated", %{caller: caller} do
      %{id: cluster_id} = insert(:cluster)
      insert(:host, heartbeat: :passing, cluster_id: cluster_id)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _publisher,
                                                                        _routing_key,
                                                                        _msg ->
        :ok
      end)

      operation =
        TrentoWeb.V1.ClusterController.open_api_operation(:cluster_maintenance_change)

      entry = %McpRouteIndex.Entry{
        controller: TrentoWeb.V1.ClusterController,
        action: :cluster_maintenance_change,
        tool_name: "synthetic_cluster_maintenance_change",
        display_text: "Cluster maintenance change (synthetic dispatch test)",
        operation: operation,
        verb: :post,
        path: "/api/v1/clusters/:id/operations/cluster_maintenance_change"
      }

      assert {:ok, body} =
               entry
               |> ControllerTool.build()
               |> Function.execute(
                 %{
                   "id" => cluster_id,
                   "maintenance" => true,
                   "resource_id" => "rsc_drbd_clusterfs"
                 },
                 %{scope: caller}
               )

      assert {:ok, %{"operation_id" => operation_id}} = Jason.decode(body)
      assert is_binary(operation_id)
    end

    test "POST with path placeholder dispatches to the action", %{caller: caller} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn _publisher, _routing_key, _msg -> :ok end
      )

      assert {:ok, _body} =
               {V1.HostController, :request_checks_execution}
               |> entry_for()
               |> invoke(%{"id" => host_id}, %{scope: caller})
    end

    test "GET with an array-typed query param explodes into repeated keys", %{caller: caller} do
      result =
        {V1.ActivityLogController, :get_activity_log}
        |> entry_for()
        |> invoke(%{"first" => 50, "severity" => ["critical"]}, %{scope: caller})

      assert {:ok, _body} = result
    end

    test "GET with path + query dispatches with the query string on the URL", %{caller: caller} do
      host = insert(:host)

      expect(Trento.Infrastructure.Prometheus.Mock, :query, fn query, _time ->
        assert query =~ host.id
        assert query =~ "node_memory_MemTotal_bytes"

        {:ok,
         %{
           "status" => "success",
           "data" => %{"resultType" => "vector", "result" => []}
         }}
      end)

      assert {:ok, body} =
               {V1.HostController, :query_metrics}
               |> entry_for()
               |> invoke(%{"id" => host.id, "query" => "node_memory_MemTotal_bytes"}, %{
                 scope: caller
               })

      assert {:ok, decoded} = Jason.decode(body)
      assert decoded == []
    end

    test "rescues exceptions during routing/execution, logging the traceback and returning error tuple",
         %{caller: caller} do
      entry = %McpRouteIndex.Entry{
        controller: V1.HostController,
        action: :list,
        tool_name: "synthetic_crash_tool",
        display_text: "Crash Tool",
        operation: %OpenApiSpex.Operation{
          parameters: [
            %OpenApiSpex.Parameter{name: :id, in: :path, required: true}
          ],
          responses: %{}
        },
        verb: :get,
        path: nil
      }

      assert {:error, reason} = invoke(entry, %{"id" => "123"}, %{scope: caller})
      assert reason =~ "tool invocation failed"
    end
  end
end

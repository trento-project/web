defmodule TrentoWeb.V1.OperationScheduleControllerTest do
  # Event sourced: the API answers after the commands are handled and projected
  use Trento.CommandedIntegrationCase

  import Mox
  import Phoenix.ConnTest
  import Plug.Conn

  @endpoint TrentoWeb.Endpoint

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup_all :setup_api_spec_v1
  setup :set_mox_global
  setup do: {:ok, conn: build_conn()}
  setup :setup_user

  defp in_days(days),
    do: DateTime.utc_now() |> DateTime.add(days, :day) |> DateTime.truncate(:second)

  defp body(host_id, overrides \\ %{}) do
    Map.merge(
      %{
        target_type: "host",
        target_id: host_id,
        operation: "reboot",
        params: %{},
        starts_at: DateTime.to_iso8601(in_days(3)),
        timezone: "Europe/Berlin",
        recurrence: nil
      },
      overrides
    )
  end

  defp post_schedule(conn, body) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/operation_schedules", body)
  end

  defp unprivileged(conn) do
    %{id: user_id} = insert(:user)
    Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
  end

  describe "create" do
    test "should schedule an operation", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

      conn
      |> post_schedule(body(host_id, %{recurrence: %{frequency: "daily", interval: 2}}))
      |> json_response(201)
      |> assert_schema("OperationScheduleV1", api_spec)
      |> then(fn schedule ->
        assert %{target_id: ^host_id, operation: "reboot", warnings: []} = schedule
        assert %{frequency: "daily", interval: 2} = schedule.recurrence
      end)
    end

    test "should return the policies that fail now as warnings", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host, heartbeat: :critical, cluster_id: nil)

      assert %{warnings: [%{message: "Trento agent is not currently running in the host"}]} =
               conn
               |> post_schedule(body(host_id))
               |> json_response(201)
               |> assert_schema("OperationScheduleV1", api_spec)
    end

    test "should refuse a schedule that is not valid", %{conn: conn} do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

      conn
      |> post_schedule(body(host_id, %{operation: "saptune_solution_apply"}))
      |> json_response(422)

      conn
      |> post_schedule(body(host_id, %{starts_at: DateTime.to_iso8601(in_days(-1))}))
      |> json_response(422)
    end

    test "should not find an unknown target", %{conn: conn} do
      conn
      |> post_schedule(body(UUID.uuid4()))
      |> json_response(404)
    end

    test "should refuse a user without the ability of the operation", %{conn: conn} do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

      conn
      |> unprivileged()
      |> post_schedule(body(host_id))
      |> json_response(403)
    end
  end

  describe "list, change and cancel" do
    setup %{conn: conn} do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)
      %{"id" => schedule_id} = conn |> post_schedule(body(host_id)) |> json_response(201)
      %{host_id: host_id, schedule_id: schedule_id}
    end

    test "should list the schedules of a target", %{
      conn: conn,
      api_spec: api_spec,
      host_id: host_id,
      schedule_id: schedule_id
    } do
      assert [%{id: ^schedule_id}] =
               conn
               |> get("/api/v1/operation_schedules?target_id=#{host_id}")
               |> json_response(200)
               |> assert_schema("OperationScheduleCollectionV1", api_spec)
    end

    test "should change a schedule", %{conn: conn, api_spec: api_spec, schedule_id: schedule_id} do
      starts_at = in_days(5)

      assert %{id: ^schedule_id, recurrence: nil, warnings: []} =
               conn
               |> put_req_header("content-type", "application/json")
               |> put("/api/v1/operation_schedules/#{schedule_id}", %{
                 starts_at: DateTime.to_iso8601(starts_at),
                 timezone: "Etc/UTC"
               })
               |> json_response(200)
               |> assert_schema("OperationScheduleV1", api_spec)
    end

    test "should cancel a schedule", %{conn: conn, host_id: host_id, schedule_id: schedule_id} do
      conn
      |> delete("/api/v1/operation_schedules/#{schedule_id}")
      |> response(204)

      assert [] ==
               conn
               |> get("/api/v1/operation_schedules?target_id=#{host_id}")
               |> json_response(200)
    end

    test "should not find an unknown schedule", %{conn: conn} do
      conn
      |> delete("/api/v1/operation_schedules/#{UUID.uuid4()}")
      |> json_response(404)

      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/operation_schedules/#{UUID.uuid4()}", %{
        starts_at: DateTime.to_iso8601(in_days(5)),
        timezone: "Etc/UTC"
      })
      |> json_response(404)
    end

    test "should refuse a change or a cancel from a user without the ability", %{
      conn: conn,
      schedule_id: schedule_id
    } do
      conn = unprivileged(conn)

      conn
      |> delete("/api/v1/operation_schedules/#{schedule_id}")
      |> json_response(403)

      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/operation_schedules/#{schedule_id}", %{
        starts_at: DateTime.to_iso8601(in_days(5)),
        timezone: "Etc/UTC"
      })
      |> json_response(403)
    end
  end
end

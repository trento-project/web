defmodule TrentoWeb.V1.ChecksScheduleControllerTest do
  use TrentoWeb.ConnCase, async: false
  # Event sourced: the settings are commands to the Host and Cluster aggregates
  use Trento.CommandedCase

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup_all :setup_api_spec_v1
  setup :setup_user

  setup do
    Mox.stub(Trento.Commanded.Mock, :dispatch, fn _, _ -> :ok end)
    :ok
  end

  setup do
    previous = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous) end)
    Application.put_env(:trento, :checks_execution, interval: nil)
  end

  defp put_schedule(conn, path, body) do
    conn
    |> put_req_header("content-type", "application/json")
    |> put(path, body)
  end

  test "should return the checks schedule of a host", %{conn: conn, api_spec: api_spec} do
    %{id: host_id} = insert(:host)

    assert %{interval: nil, effective_interval: "5m", in_exception_window: false} =
             conn
             |> get("/api/v1/hosts/#{host_id}/checks/schedule")
             |> json_response(200)
             |> assert_schema("ChecksScheduleV1", api_spec)
  end

  test "should change the checks schedule of a host and a cluster", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: host_id} = insert(:host)
    %{id: cluster_id} = insert(:cluster)

    window = %{
      starts_at: DateTime.utc_now() |> DateTime.add(1, :day) |> DateTime.to_iso8601(),
      timezone: "Europe/Berlin",
      duration_minutes: 60,
      recurrence: %{frequency: "weekly", interval: 1, weekdays: [6, 7]}
    }

    assert %{interval: "6h", exception_window: %{duration_minutes: 60}} =
             conn
             |> put_schedule("/api/v1/hosts/#{host_id}/checks/schedule", %{
               interval: "6h",
               exception_window: window
             })
             |> json_response(200)
             |> assert_schema("ChecksScheduleV1", api_spec)

    assert %{interval: "disabled", next_execution_at: nil} =
             conn
             |> put_schedule("/api/v1/clusters/#{cluster_id}/checks/schedule", %{
               interval: "disabled",
               exception_window: nil
             })
             |> json_response(200)
             |> assert_schema("ChecksScheduleV1", api_spec)
  end

  test "should refuse invalid settings", %{conn: conn} do
    %{id: host_id} = insert(:host)

    conn
    |> put_schedule("/api/v1/hosts/#{host_id}/checks/schedule", %{
      interval: "7m",
      exception_window: nil
    })
    |> json_response(422)
  end

  test "should not find an unknown target", %{conn: conn} do
    conn
    |> get("/api/v1/clusters/#{UUID.uuid4()}/checks/schedule")
    |> json_response(404)
  end

  test "should refuse a change from a user without the check selection ability", %{conn: conn} do
    %{id: host_id} = insert(:host)
    %{id: user_id} = insert(:user)

    conn
    |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
    |> put_schedule("/api/v1/hosts/#{host_id}/checks/schedule", %{
      interval: "6h",
      exception_window: nil
    })
    |> json_response(403)
  end
end

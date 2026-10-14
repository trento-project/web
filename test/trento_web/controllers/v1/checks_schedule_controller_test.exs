# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleControllerTest do
  # Not async: tests change the :checks_execution application env
  use TrentoWeb.ConnCase, async: false

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper
  import Mox

  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  setup_all :setup_api_spec_v1
  setup :setup_user
  setup :verify_on_exit!

  setup do
    previous_env = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous_env) end)
    Application.put_env(:trento, :checks_execution, interval: nil)

    :ok
  end

  describe "global checks execution settings" do
    test "should return the default settings", %{conn: conn, api_spec: api_spec} do
      assert %{interval: 5, enforced_from_env: false} =
               conn
               |> get("/api/v1/settings/checks_execution")
               |> json_response(200)
               |> assert_schema("ChecksExecutionSettingsV1", api_spec)
    end

    test "should update the interval", %{conn: conn, api_spec: api_spec} do
      assert %{interval: 60} =
               conn
               |> put_req_header("content-type", "application/json")
               |> put("/api/v1/settings/checks_execution", %{interval: 60})
               |> json_response(200)
               |> assert_schema("ChecksExecutionSettingsV1", api_spec)
    end

    test "should reject an interval that is not allowed", %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/checks_execution", %{interval: 7})
      |> json_response(422)
      |> assert_schema("UnprocessableEntityV1", api_spec)
    end

    test "should not update the interval enforced from the environment", %{conn: conn} do
      Application.put_env(:trento, :checks_execution, interval: 10)

      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/checks_execution", %{interval: 60})
      |> json_response(409)
    end
  end

  describe "target checks schedule" do
    test "should return the schedule of a host", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      assert %{
               interval: nil,
               effective_interval: 5,
               exception_window: nil,
               in_exception_window: false
             } =
               conn
               |> get("/api/v1/hosts/#{host_id}/checks/schedule")
               |> json_response(200)
               |> assert_schema("ChecksScheduleV1", api_spec)
    end

    test "should set the interval and a recurring exception window of a cluster", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: cluster_id} = insert(:cluster)

      assert %{
               interval: 60,
               effective_interval: 60,
               exception_window: %{
                 frequency: "weekly",
                 weekdays: [1, 5],
                 timezone: "Europe/Berlin",
                 duration: 60
               }
             } =
               conn
               |> put_req_header("content-type", "application/json")
               |> put("/api/v1/clusters/#{cluster_id}/checks/schedule", %{
                 interval: 60,
                 exception_window: %{
                   starts_at: "2026-10-12T22:00:00Z",
                   duration: 60,
                   timezone: "Europe/Berlin",
                   frequency: "weekly",
                   interval: 2,
                   weekdays: [1, 5]
                 }
               })
               |> json_response(200)
               |> assert_schema("ChecksScheduleV1", api_spec)
    end

    test "should reset the interval and remove the exception window of a host", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host)

      {:ok, _} =
        Trento.ChecksScheduling.update_target_schedule(host_id, :host, %{
          interval: 60,
          exception_window: %{starts_at: ~U[2026-10-14 10:00:00Z], duration: 90}
        })

      assert %{interval: nil, effective_interval: 5, exception_window: nil} =
               conn
               |> put_req_header("content-type", "application/json")
               |> put("/api/v1/hosts/#{host_id}/checks/schedule", %{
                 interval: nil,
                 exception_window: nil
               })
               |> json_response(200)
               |> assert_schema("ChecksScheduleV1", api_spec)
    end

    test "should refuse a checks execution inside an exception window", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: cluster_id} = insert(:cluster, type: ClusterType.hana_scale_up())

      {:ok, _} =
        Trento.ChecksScheduling.update_target_schedule(cluster_id, :cluster, %{
          interval: nil,
          exception_window: %{
            starts_at: DateTime.add(DateTime.utc_now(), -5, :minute),
            duration: 30
          }
        })

      assert %{in_exception_window: true} =
               conn
               |> get("/api/v1/clusters/#{cluster_id}/checks/schedule")
               |> json_response(200)
               |> assert_schema("ChecksScheduleV1", api_spec)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert %{"errors" => [%{"detail" => "Checks cannot be executed during exception window."}]} =
               conn
               |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution")
               |> json_response(422)
    end

    test "should forbid changing the schedule without the checks selection ability", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host)
      %{id: user_id} = insert(:user)

      conn
      |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/hosts/#{host_id}/checks/schedule", %{interval: 60, exception_window: nil})
      |> json_response(:forbidden)
      |> assert_schema("ForbiddenV1", api_spec)
    end
  end
end

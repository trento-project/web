# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationScheduleControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Oban.Testing, repo: Trento.Repo

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias Trento.Infrastructure.Jobs.ScheduledOperationJob

  setup_all :setup_api_spec_v1
  setup :setup_user

  defp future(hours),
    do: DateTime.utc_now() |> DateTime.add(hours, :hour) |> DateTime.to_iso8601()

  defp create(conn, host_id, attrs) do
    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/hosts/#{host_id}/operation_schedules", attrs)
  end

  test "should schedule, list, change and cancel an operation", %{conn: conn, api_spec: api_spec} do
    %{id: host_id} = insert(:host)

    %{id: schedule_id} =
      conn
      |> create(host_id, %{
        operation: "saptune_solution_apply",
        params: %{solution: "HANA"},
        starts_at: future(2),
        timezone: "Europe/Berlin",
        frequency: "weekly",
        interval: 1,
        weekdays: [6]
      })
      |> json_response(201)
      |> assert_schema("OperationScheduleV1", api_spec)

    assert_enqueued(worker: ScheduledOperationJob, args: %{schedule_id: schedule_id})

    assert [%{id: ^schedule_id, operation: "saptune_solution_apply"}] =
             conn
             |> get("/api/v1/hosts/#{host_id}/operation_schedules")
             |> json_response(200)
             |> assert_schema("OperationSchedulesV1", api_spec)

    assert %{frequency: nil} =
             conn
             |> put_req_header("content-type", "application/json")
             |> put("/api/v1/hosts/#{host_id}/operation_schedules/#{schedule_id}", %{
               starts_at: future(3),
               timezone: "Europe/Berlin",
               frequency: nil
             })
             |> json_response(200)
             |> assert_schema("OperationScheduleV1", api_spec)

    conn
    |> delete("/api/v1/hosts/#{host_id}/operation_schedules/#{schedule_id}")
    |> response(204)
  end

  test "should reject a schedule starting in the past", %{conn: conn, api_spec: api_spec} do
    %{id: host_id} = insert(:host)

    conn
    |> create(host_id, %{operation: "reboot", starts_at: future(-1), timezone: "Etc/UTC"})
    |> json_response(422)
    |> assert_schema("UnprocessableEntityV1", api_spec)
  end

  test "should forbid scheduling an operation the user cannot request", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: host_id} = insert(:host)
    %{id: user_id} = insert(:user)

    conn
    |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
    |> create(host_id, %{operation: "reboot", starts_at: future(1), timezone: "Etc/UTC"})
    |> json_response(:forbidden)
    |> assert_schema("ForbiddenV1", api_spec)
  end
end

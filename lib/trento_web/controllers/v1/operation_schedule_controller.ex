# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationScheduleController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Operations.{OperationSchedule, Requests, Schedules}
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling

  plug TrentoWeb.Plugs.LoadUserPlug
  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  action_fallback TrentoWeb.FallbackController

  tags ["Operations"]

  operation :index,
    summary: "List the operation schedules of a target.",
    parameters: [
      target_id: [
        in: :query,
        required: true,
        description: "Host, cluster, SAP system or database id.",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      ok:
        {"Schedules of the target.", "application/json", Scheduling.OperationScheduleCollection},
      unauthorized: Schema.Unauthorized.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def index(conn, %{target_id: target_id}) do
    render(conn, :operation_schedules, schedules: Schedules.list_schedules(target_id))
  end

  operation :create,
    summary: "Schedule an operation.",
    description:
      "Schedules an operation once or periodically. The schedule is saved even when the operation policies fail now: they come back as warnings and run again when the schedule is due.",
    request_body: {"Schedule.", "application/json", Scheduling.CreateOperationScheduleRequest},
    responses: [
      created: {"Saved schedule.", "application/json", Scheduling.OperationSchedule},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create(conn, _) do
    attrs = OpenApiSpex.body_params(conn)
    user = Pow.Plug.current_user(conn)

    with :ok <- authorize(user, attrs.target_type, attrs.operation),
         {:ok, schedule, warnings} <- Schedules.create_schedule(attrs, user.username) do
      conn
      |> put_status(:created)
      |> render(:operation_schedule, schedule: schedule, warnings: warnings)
    end
  end

  operation :bulk_create,
    summary: "Schedule an operation on several targets.",
    description:
      "Schedules the same operation on several targets of one type. It creates one schedule per target, all with the same bulk_id. Schedules can only be changed and cancelled one by one.",
    request_body:
      {"Targets and schedule.", "application/json", Scheduling.BulkCreateOperationScheduleRequest},
    responses: [
      created: {"Saved schedules.", "application/json", Scheduling.BulkOperationSchedules},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def bulk_create(conn, _) do
    attrs = OpenApiSpex.body_params(conn)
    user = Pow.Plug.current_user(conn)

    with :ok <- authorize(user, attrs.target_type, attrs.operation),
         {:ok, bulk_id, results} <- Schedules.create_bulk_schedules(attrs, user.username) do
      conn
      |> put_status(:created)
      |> render(:bulk_operation_schedules, bulk_id: bulk_id, results: results)
    end
  end

  operation :update,
    summary: "Change an operation schedule.",
    parameters: [
      id: [in: :path, required: true, schema: %OpenApiSpex.Schema{type: :string, format: :uuid}]
    ],
    request_body:
      {"New timing and params.", "application/json", Scheduling.UpdateOperationScheduleRequest},
    responses: [
      ok: {"Changed schedule.", "application/json", Scheduling.OperationSchedule},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(conn, %{id: schedule_id}) do
    user = Pow.Plug.current_user(conn)

    with {:ok, current} <- Schedules.get_schedule(schedule_id),
         :ok <- authorize(user, current),
         {:ok, schedule, warnings} <-
           Schedules.update_schedule(schedule_id, OpenApiSpex.body_params(conn), user.username) do
      render(conn, :operation_schedule, schedule: schedule, warnings: warnings)
    end
  end

  operation :delete,
    summary: "Cancel an operation schedule.",
    parameters: [
      id: [in: :path, required: true, schema: %OpenApiSpex.Schema{type: :string, format: :uuid}]
    ],
    responses: [
      no_content: "The schedule is cancelled.",
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response()
    ]

  def delete(conn, %{id: schedule_id}) do
    user = Pow.Plug.current_user(conn)

    with {:ok, schedule} <- Schedules.get_schedule(schedule_id),
         :ok <- authorize(user, schedule),
         :ok <- Schedules.cancel_schedule(schedule_id, user.username) do
      send_resp(conn, :no_content, "")
    end
  end

  defp authorize(user, %OperationSchedule{target_type: target_type, operation: operation}),
    do: authorize(user, target_type, operation)

  defp authorize(user, target_type, operation) do
    with {:ok, target_type, operation} <- Requests.parse(target_type, operation),
         true <- Requests.allowed?(user, target_type, operation) do
      :ok
    else
      _ -> {:error, :forbidden}
    end
  end
end

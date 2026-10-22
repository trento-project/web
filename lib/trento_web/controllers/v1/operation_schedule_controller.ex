# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationScheduleController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Operations.Schedules
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.OperationSchedule

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Operations.SchedulePolicy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Operations"]

  @host_id [
    id: [
      in: :path,
      required: true,
      description: "Unique identifier of the host.",
      schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
    ]
  ]

  @schedule_id [
    schedule_id: [
      in: :path,
      required: true,
      schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
    ]
  ]

  operation :index,
    summary: "Lists the operation schedules of a host.",
    parameters: @host_id,
    responses: [
      ok: {"Operation schedules.", "application/json", OperationSchedule.OperationSchedules}
    ]

  def index(conn, %{id: host_id}),
    do: render(conn, :operation_schedules, schedules: Schedules.list_schedules(host_id))

  operation :create,
    summary: "Schedules an operation on a host, once or periodically.",
    parameters: @host_id,
    request_body:
      {"Operation schedule.", "application/json",
       OperationSchedule.CreateOperationScheduleRequest},
    responses: [
      created: {"Operation schedule.", "application/json", OperationSchedule.OperationSchedule},
      forbidden: Schema.Forbidden.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create(conn, %{id: host_id}) do
    attrs =
      conn
      |> OpenApiSpex.body_params()
      |> Map.merge(%{target_type: :host, target_id: host_id})

    with {:ok, schedule} <- Schedules.create_schedule(attrs, Pow.Plug.current_user(conn)) do
      conn
      |> put_status(:created)
      |> render(:operation_schedule, schedule: schedule)
    end
  end

  operation :update,
    summary: "Changes an operation schedule of a host.",
    parameters: @host_id ++ @schedule_id,
    request_body:
      {"Operation schedule.", "application/json",
       OperationSchedule.UpdateOperationScheduleRequest},
    responses: [
      ok: {"Operation schedule.", "application/json", OperationSchedule.OperationSchedule},
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(conn, %{schedule_id: schedule_id}) do
    attrs = OpenApiSpex.body_params(conn)

    with {:ok, schedule} <-
           Schedules.update_schedule(schedule_id, attrs, Pow.Plug.current_user(conn)) do
      render(conn, :operation_schedule, schedule: schedule)
    end
  end

  operation :delete,
    summary: "Cancels an operation schedule of a host.",
    parameters: @host_id ++ @schedule_id,
    responses: [
      no_content: "The schedule has been cancelled.",
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response()
    ]

  def delete(conn, %{schedule_id: schedule_id}) do
    with :ok <- Schedules.delete_schedule(schedule_id, Pow.Plug.current_user(conn)) do
      send_resp(conn, :no_content, "")
    end
  end

  # Runs before CastAndValidate: params are not cast yet
  def get_policy_resource(%{private: %{phoenix_action: :create}, body_params: body_params}),
    do: %{operation: body_params["operation"]}

  def get_policy_resource(%{private: %{phoenix_action: action}, path_params: path_params})
      when action in [:update, :delete] do
    case Schedules.get_schedule(path_params["schedule_id"]) do
      nil -> %{}
      %{operation: operation} -> %{operation: operation}
    end
  end

  def get_policy_resource(_), do: %{}
end

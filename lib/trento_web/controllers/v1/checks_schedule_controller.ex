# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ChecksScheduling
  alias Trento.Settings
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.ChecksSchedule

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.ChecksScheduling.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Checks"]

  @target_id [
    id: [
      in: :path,
      description: "Unique identifier of the host or cluster.",
      required: true,
      schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
    ]
  ]

  operation :show,
    summary: "Gets the checks execution schedule of a host or cluster.",
    parameters: @target_id,
    responses: [
      ok: {"Checks execution schedule.", "application/json", ChecksSchedule.ChecksSchedule}
    ]

  def show(conn, %{id: target_id}), do: render_schedule(conn, target_id)

  operation :update,
    summary: "Sets or resets the checks execution interval of a host or cluster.",
    parameters: @target_id,
    request_body:
      {"Checks execution interval.", "application/json",
       ChecksSchedule.UpdateChecksScheduleRequest},
    responses: [
      ok: {"Checks execution schedule.", "application/json", ChecksSchedule.ChecksSchedule},
      forbidden: Schema.Forbidden.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(%{assigns: %{target_type: target_type}} = conn, %{id: target_id}) do
    %{interval: interval} = OpenApiSpex.body_params(conn)

    with {:ok, _} <- ChecksScheduling.set_target_interval(target_id, target_type, interval) do
      render_schedule(conn, target_id)
    end
  end

  operation :create_exception_window,
    summary: "Adds a checks exception window to a host or cluster.",
    parameters: @target_id,
    request_body:
      {"Exception window.", "application/json", ChecksSchedule.CreateExceptionWindowRequest},
    responses: [
      created: {"Exception window.", "application/json", ChecksSchedule.ExceptionWindow},
      forbidden: Schema.Forbidden.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create_exception_window(%{assigns: %{target_type: target_type}} = conn, %{id: target_id}) do
    attrs = OpenApiSpex.body_params(conn)

    with {:ok, window} <- ChecksScheduling.add_exception_window(target_id, target_type, attrs) do
      conn
      |> put_status(:created)
      |> render(:exception_window, %{exception_window: window})
    end
  end

  operation :delete_exception_window,
    summary: "Deletes a checks exception window of a host or cluster.",
    parameters:
      @target_id ++
        [
          window_id: [
            in: :path,
            required: true,
            schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
          ]
        ],
    responses: [
      no_content: "The exception window has been deleted.",
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response()
    ]

  def delete_exception_window(conn, %{id: target_id, window_id: window_id}) do
    with :ok <- ChecksScheduling.delete_exception_window(target_id, window_id) do
      send_resp(conn, :no_content, "")
    end
  end

  def get_policy_resource(%{assigns: %{target_type: target_type}}),
    do: %{target_type: target_type}

  defp render_schedule(conn, target_id) do
    {:ok, %{interval: global_interval}} = Settings.get_checks_execution_settings()
    schedule = ChecksScheduling.get_target_schedule(target_id)

    render(conn, :checks_schedule, %{
      checks_schedule:
        Map.put(schedule, :effective_interval, schedule.interval || global_interval)
    })
  end
end

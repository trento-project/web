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
    summary: "Sets the checks execution interval and the exception window of a host or cluster.",
    parameters: @target_id,
    request_body:
      {"Checks execution interval and exception window.", "application/json",
       ChecksSchedule.UpdateChecksScheduleRequest},
    responses: [
      ok: {"Checks execution schedule.", "application/json", ChecksSchedule.ChecksSchedule},
      forbidden: Schema.Forbidden.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(%{assigns: %{target_type: target_type}} = conn, %{id: target_id}) do
    %{interval: interval, exception_window: exception_window} = OpenApiSpex.body_params(conn)

    with {:ok, _} <-
           ChecksScheduling.update_target_schedule(target_id, target_type, %{
             interval: interval,
             exception_window: exception_window
           }) do
      render_schedule(conn, target_id)
    end
  end

  def get_policy_resource(%{assigns: %{target_type: target_type}}),
    do: %{target_type: target_type}

  defp render_schedule(conn, target_id) do
    {:ok, %{interval: global_interval}} = Settings.get_checks_execution_settings()
    schedule = ChecksScheduling.get_target_schedule(target_id)

    render(conn, :checks_schedule, %{
      checks_schedule:
        Map.merge(schedule, %{
          effective_interval: schedule.interval || global_interval,
          in_exception_window: ChecksScheduling.in_exception_window?(target_id)
        })
    })
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ChecksScheduling
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling

  plug TrentoWeb.Plugs.LoadUserPlug
  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  action_fallback TrentoWeb.FallbackController

  tags ["Checks"]

  @id_param [
    id: [
      in: :path,
      required: true,
      description: "Host or cluster id.",
      schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
    ]
  ]

  operation :show,
    summary: "Get the checks execution settings of a host or cluster.",
    parameters: @id_param,
    responses: [
      ok: {"Checks execution settings.", "application/json", Scheduling.ChecksSchedule},
      unauthorized: Schema.Unauthorized.response(),
      not_found: Schema.NotFound.response()
    ]

  def show(%{assigns: %{target_type: target_type}} = conn, %{id: id}) do
    with {:ok, schedule} <- ChecksScheduling.get_target_schedule(target_type, id) do
      json(conn, schedule)
    end
  end

  operation :update,
    summary: "Change the checks execution settings of a host or cluster.",
    description:
      "Sets the checks execution interval of the target (null for the global one) and its exception window (null for none).",
    parameters: @id_param,
    request_body:
      {"Interval and exception window.", "application/json",
       Scheduling.UpdateChecksScheduleRequest},
    responses: [
      ok: {"Checks execution settings.", "application/json", Scheduling.ChecksSchedule},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(%{assigns: %{target_type: target_type}} = conn, %{id: id}) do
    with :ok <- authorize(target_type, Pow.Plug.current_user(conn)),
         {:ok, schedule} <-
           ChecksScheduling.update_target_schedule(target_type, id, OpenApiSpex.body_params(conn)) do
      json(conn, schedule)
    end
  end

  defp authorize(:host, user),
    do: allowed(Trento.Hosts.Policy.authorize(:select_checks, user, HostReadModel))

  defp authorize(:cluster, user),
    do: allowed(Trento.Clusters.Policy.authorize(:select_checks, user, ClusterReadModel))

  defp allowed(true), do: :ok
  defp allowed(false), do: {:error, :forbidden}
end

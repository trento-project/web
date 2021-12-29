defmodule Tronto.ProjectorTestHelper do
  @moduledoc """
  This module contains helper functions for testing projectors
  """

  def project(projector, event, projection_name) do
    :ok =
      projector.handle(event, %{
        event_number: next_event_number(projector, projection_name),
        handler_name: projection_name
      })
  end

  defp next_event_number(projector, projection_name),
    do: last_seen_event_number(projector, projection_name) + 1

  defp last_seen_event_number(projector, projection_name) do
    projector
    |> Module.concat(ProjectionVersion)
    |> Tronto.Repo.get(projection_name)
    |> case do
      nil ->
        0

      projection_version ->
        Map.get(projection_version, :last_seen_event_number)
    end
  end
end

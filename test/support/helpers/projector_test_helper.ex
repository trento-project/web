# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.ProjectorTestHelper do
  @moduledoc """
  This module contains helper functions for testing projectors
  """

  def project(projector, event, metadata \\ %{}, projection_name) do
    system_metadata = %{
      event_number: next_event_number(projector, projection_name),
      handler_name: projection_name
    }

    :ok =
      projector.handle(event, Map.merge(system_metadata, metadata))
  end

  defp next_event_number(projector, projection_name),
    do: last_seen_event_number(projector, projection_name) + 1

  defp last_seen_event_number(projector, projection_name) do
    projector
    |> Module.concat(ProjectionVersion)
    |> Trento.Repo.get(projection_name)
    |> case do
      nil ->
        0

      projection_version ->
        Map.get(projection_version, :last_seen_event_number)
    end
  end
end

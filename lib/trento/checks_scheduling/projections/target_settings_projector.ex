# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.Projections.TargetSettingsProjector do
  @moduledoc """
  Projects the checks execution settings of hosts and clusters into their own
  read model, so that the host and cluster read models stay as they are.
  Strongly consistent: the settings are read back right after a change.
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "checks_target_settings_projector",
    consistency: :strong

  alias Trento.ChecksScheduling.Projections.TargetSettingsReadModel
  alias Trento.Clusters.Events.ClusterChecksScheduleUpdated
  alias Trento.Hosts.Events.HostChecksScheduleUpdated

  project(%HostChecksScheduleUpdated{host_id: host_id} = event, fn multi ->
    upsert(multi, host_id, "host", event)
  end)

  project(%ClusterChecksScheduleUpdated{cluster_id: cluster_id} = event, fn multi ->
    upsert(multi, cluster_id, "cluster", event)
  end)

  defp upsert(multi, target_id, target_type, %{interval: interval, exception_window: window}) do
    Ecto.Multi.insert(
      multi,
      :checks_target_settings,
      %TargetSettingsReadModel{
        target_id: target_id,
        target_type: target_type,
        interval: interval,
        exception_window: window
      },
      on_conflict: {:replace, [:interval, :exception_window, :updated_at]},
      conflict_target: :target_id
    )
  end
end

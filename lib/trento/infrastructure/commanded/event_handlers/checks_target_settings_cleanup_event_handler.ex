# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.EventHandlers.ChecksTargetSettingsCleanupEventHandler do
  @moduledoc """
  Deletes the checks frequency settings of the deregistered hosts and clusters,
  so that a restored target uses the global ones.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "checks_target_settings_cleanup_event_handler",
    start_from: :current

  alias Trento.Checks
  alias Trento.Clusters.Events.ClusterDeregistered
  alias Trento.Hosts.Events.HostDeregistered

  def handle(%HostDeregistered{host_id: host_id}, _metadata),
    do: Checks.delete_target_settings(host_id)

  def handle(%ClusterDeregistered{cluster_id: cluster_id}, _metadata),
    do: Checks.delete_target_settings(cluster_id)
end

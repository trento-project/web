# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.EventHandlers.ChecksTargetSettingsCleanupEventHandler do
  @moduledoc """
  Deletes the checks frequency settings of the deregistered hosts and clusters,
  so that a restored target uses the global ones.

  The settings are deleted again at restore. The roll-up archives the events of a
  deregistered target at once, so a deletion missed at deregistration, by a crash or a
  restart of this handler, is never retried.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "checks_target_settings_cleanup_event_handler",
    start_from: :current

  alias Trento.Checks
  alias Trento.Clusters.Events.{ClusterDeregistered, ClusterRestored}
  alias Trento.Hosts.Events.{HostDeregistered, HostRestored}

  def handle(%HostDeregistered{host_id: host_id}, _metadata),
    do: Checks.delete_target_settings(host_id)

  def handle(%ClusterDeregistered{cluster_id: cluster_id}, _metadata),
    do: Checks.delete_target_settings(cluster_id)

  def handle(%HostRestored{host_id: host_id}, _metadata),
    do: Checks.delete_target_settings(host_id)

  def handle(%ClusterRestored{cluster_id: cluster_id}, _metadata),
    do: Checks.delete_target_settings(cluster_id)
end

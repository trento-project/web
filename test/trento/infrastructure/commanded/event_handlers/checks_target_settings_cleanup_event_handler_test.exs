# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.EventHandlers.ChecksTargetSettingsCleanupEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Checks
  alias Trento.Clusters.Events.ClusterDeregistered
  alias Trento.Hosts.Events.HostDeregistered
  alias Trento.Infrastructure.Commanded.EventHandlers.ChecksTargetSettingsCleanupEventHandler

  test "should delete the settings of a deregistered host" do
    %{target_id: host_id} = insert(:checks_target_settings, target_type: :host)
    %{target_id: other_id} = insert(:checks_target_settings, target_type: :host)

    assert :ok =
             ChecksTargetSettingsCleanupEventHandler.handle(
               %HostDeregistered{host_id: host_id, deregistered_at: DateTime.utc_now()},
               %{}
             )

    assert nil == Checks.get_target_settings(host_id)
    refute nil == Checks.get_target_settings(other_id)
  end

  test "should delete the settings of a deregistered cluster" do
    %{target_id: cluster_id} = insert(:checks_target_settings, target_type: :cluster)

    assert :ok =
             ChecksTargetSettingsCleanupEventHandler.handle(
               %ClusterDeregistered{cluster_id: cluster_id, deregistered_at: DateTime.utc_now()},
               %{}
             )

    assert nil == Checks.get_target_settings(cluster_id)
  end
end

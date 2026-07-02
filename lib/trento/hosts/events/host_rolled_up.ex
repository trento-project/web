# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.Events.HostRolledUp do
  @moduledoc """
  This event is emitted when an host is rolled up and its stream is archived.
  It contains the snapshot of the host aggregate that will be used to restore the aggregate state.
  """

  use Trento.Support.Event

  alias Trento.Hosts.Host

  defevent version: 2 do
    field :host_id, Ecto.UUID
    embeds_one :snapshot, Host
  end

  # Handle old HostRolledUp, inherited from the previous aggregate
  # when checks_health, saptune_health and
  # software_updates_discovery_health were independent fields. They
  # are now moved into combined struct located at health_details key.
  def upcast(
        %{
          "snapshot" =>
            %{
              "checks_health" => checks_health,
              "saptune_health" => saptune_health,
              "software_updates_discovery_health" => software_updates_discovery_health
            } = snapshot
        } = params,
        _,
        2
      ) do
    new_snapshot =
      snapshot
      |> Map.put("health_details", %{
        "checks_health" => checks_health,
        "saptune_health" => saptune_health,
        "software_updates_discovery_health" => software_updates_discovery_health
      })
      |> Map.drop(["checks_health", "saptune_health", "software_updates_discovery_health"])

    Map.put(params, "snapshot", new_snapshot)
  end
end

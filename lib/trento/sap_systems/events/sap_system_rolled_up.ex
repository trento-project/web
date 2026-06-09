# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemRolledUp do
  @moduledoc """
  This event is emitted when a sap system roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the sap system aggregate.
  """

  alias Trento.Databases.Events.DatabaseRolledUp
  alias Trento.SapSystems.Services.HealthService

  use Trento.Support.Event

  # Supersede the event to DatabaseRolledUp if the snapshot has the old format
  # from events where the sap system and database aggregates were together.
  # If this supersede function matches, the params are upcasted in the
  # DatabaseRolledUp event itself
  def supersede(%{"snapshot" => %{"database" => _}}) do
    DatabaseRolledUp
  end

  defevent resource: "sap_system", version: 3 do
    field :sap_system_id, Ecto.UUID
    embeds_one :snapshot, Trento.SapSystems.SapSystem
  end

  def upcast(params, _, 2), do: params

  def upcast(
        %{
          "sap_system_id" => sap_system_id,
          "snapshot" =>
            %{
              "instances" => instances
            } = snapshot
        },
        _,
        3
      ) do
    %{
      "sap_system_id" => sap_system_id,
      "snapshot" => %{
        snapshot
        | "instances" => Enum.map(instances, &HealthService.upcast_health_to_status/1)
      }
    }
  end

  def upcast(params, _, 3), do: params
end

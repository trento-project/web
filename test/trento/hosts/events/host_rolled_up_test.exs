# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.Events.HostRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Hosts.Host
  alias Trento.Hosts.Events.HostRolledUp

  alias Trento.Hosts.ValueObjects.HealthDetails

  test "should upcast the legacy snapshot with separate health details fields" do
    host_id = Faker.UUID.v4()

    upcasted_event =
      %{
        "version" => 1,
        "host_id" => host_id,
        "snapshot" => %{
          "checks_health" => Health.warning(),
          "saptune_health" => Health.unknown(),
          "software_updates_discovery_health" => Health.passing()
        }
      }
      |> HostRolledUp.upcast(%{})
      |> HostRolledUp.new!()

    assert %HostRolledUp{
             version: 2,
             host_id: ^host_id,
             snapshot: %Host{
               health_details: %HealthDetails{
                 checks_health: Health.warning(),
                 saptune_health: Health.unknown(),
                 software_updates_discovery_health: Health.passing()
               }
             }
           } = upcasted_event

    assert Map.take(
             upcasted_event,
             [:checks_health, :saptune_health, :software_updates_discovery_health]
           ) == %{}
  end
end

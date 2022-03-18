defmodule Trento.Integration.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Integration.Discovery
  alias Trento.Integration.Discovery.DiscoveryEvent

  test "should retrieve the current set of discovery events" do
    agent_id_1 = Faker.UUID.v4()
    agent_id_2 = Faker.UUID.v4()
    agent_id_3 = Faker.UUID.v4()

    for index <- 0..9 do
      discovery_event(
        agent_id: agent_id_1,
        discovery_type: "discovery_type",
        payload: %{"key" => index}
      )

      discovery_event(
        agent_id: agent_id_2,
        discovery_type: "discovery_type",
        payload: %{"key" => index}
      )

      discovery_event(
        agent_id: agent_id_3,
        discovery_type: "discovery_type",
        payload: %{"key" => index}
      )
    end

    discovery_events = Discovery.get_current_discovery_events()

    [
      %DiscoveryEvent{agent_id: ^agent_id_1, payload: %{"key" => 9}},
      %DiscoveryEvent{agent_id: ^agent_id_2, payload: %{"key" => 9}},
      %DiscoveryEvent{agent_id: ^agent_id_3, payload: %{"key" => 9}}
    ] = discovery_events
  end
end

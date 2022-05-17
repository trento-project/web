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
      insert(
        :discovery_event,
        agent_id: agent_id_1,
        discovery_type: "discovery_type",
        payload: %{"key" => index}
      )

      insert(
        :discovery_event,
        agent_id: agent_id_1,
        discovery_type: "discovery_type",
        payload: %{"key" => index, "error_filed" => "error_content"},
        accepted: false
      )

      insert(
        :discovery_event,
        agent_id: agent_id_2,
        discovery_type: "discovery_type",
        payload: %{"key" => index}
      )

      insert(
        :discovery_event,
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

  test "should retrieve the unaccepted events" do
    agent_id = Faker.UUID.v4()

    insert(
      :discovery_event,
      agent_id: agent_id,
      discovery_type: "discovery_type",
      payload: %{"key" => 1},
      accepted: false,
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 1)
    )

    insert(
      :discovery_event,
      agent_id: agent_id,
      discovery_type: "discovery_type",
      payload: %{"key" => 2},
      accepted: true,
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 2)
    )

    insert(
      :discovery_event,
      agent_id: agent_id,
      discovery_type: "discovery_type",
      payload: %{"key" => 3},
      accepted: false,
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 3)
    )

    insert(
      :discovery_event,
      agent_id: agent_id,
      discovery_type: "discovery_type",
      payload: %{"key" => 4},
      accepted: false,
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 4)
    )

    unaccepted_events = Discovery.get_unaccepted_events(2)

    [
      %DiscoveryEvent{agent_id: ^agent_id, payload: %{"key" => 4}},
      %DiscoveryEvent{agent_id: ^agent_id, payload: %{"key" => 3}}
    ] = unaccepted_events
  end

  test "should delete events older than the specified days" do
    for _ <- 0..9 do
      insert(
        :discovery_event,
        agent_id: Faker.UUID.v4(),
        discovery_type: "discovery_type",
        payload: %{},
        inserted_at: Timex.shift(DateTime.utc_now(), days: -11)
      )
    end

    assert 10 == Discovery.prune_events(10)
    assert 0 == DiscoveryEvent |> Trento.Repo.all() |> length()
  end

  @tag capture_log: true
  test "should use a default UUID for unaccepted events with invalid agent_id" do
    event = %{
      "agent_id" => "invalid_uuid",
      "discovery_type" => "host_discovery",
      "payload" => %{}
    }

    {:error, _} = Discovery.handle(event)

    invalid_events = DiscoveryEvent |> Trento.Repo.all()

    [
      %DiscoveryEvent{agent_id: "00000000-0000-0000-0000-000000000000"}
    ] = invalid_events
  end
end

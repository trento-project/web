defmodule Trento.Integration.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Integration.Discovery
  alias Trento.Integration.Discovery.{
    DiscardedEvent,
    DiscoveryEvent
  }

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

  test "should retrieve the discarded events" do
    insert(
      :discarded_event,
      payload: %{"key" => 1},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 1)
    )

    insert(
      :discarded_event,
      payload: %{"key" => 2},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 2)
    )

    insert(
      :discarded_event,
      payload: %{"key" => 3},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 3)
    )

    insert(
      :discarded_event,
      payload: %{"key" => 4},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 4)
    )

    unaccepted_events = Discovery.get_discarded_events(2)

    [
      %DiscardedEvent{payload: %{"key" => 4}},
      %DiscardedEvent{payload: %{"key" => 3}}
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
  test "should discard events with invalid agent_id" do
    event = %{
      "agent_id" => "invalid_uuid",
      "discovery_type" => "host_discovery",
      "payload" => %{"key" => "value"}
    }

    {:error, _} = Discovery.handle(event)

    discarded_events = DiscardedEvent |> Trento.Repo.all()

    [
      %DiscardedEvent{payload: ^event}
    ] = discarded_events
  end
end

defmodule Trento.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  import Trento.DiscoveryFixturesHelper

  alias Trento.Discovery

  alias Trento.Discovery.{
    DiscardedDiscoveryEvent,
    DiscoveryEvent
  }

  alias Trento.Infrastructure.Discovery.AMQP.Publisher

  alias Trento.Discoveries.V1.DiscoveryRequested

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

  test "should retrieve the discarded discovery events" do
    insert(
      :discarded_discovery_event,
      payload: %{"key" => 1},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 1)
    )

    insert(
      :discarded_discovery_event,
      payload: %{"key" => 2},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 2)
    )

    insert(
      :discarded_discovery_event,
      payload: %{"key" => 3},
      reason: "invalid value",
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 3)
    )

    insert(
      :discarded_discovery_event,
      payload: %{"key" => 4},
      inserted_at: Timex.shift(DateTime.utc_now(), seconds: 4)
    )

    discarded_events = Discovery.get_discarded_discovery_events(2)

    [
      %DiscardedDiscoveryEvent{payload: %{"key" => 4}},
      %DiscardedDiscoveryEvent{payload: %{"key" => 3}, reason: "invalid value"}
    ] = discarded_events
  end

  test "should delete events older than the specified days" do
    insert_list(
      10,
      :discovery_event,
      discovery_type: "discovery_type",
      payload: %{},
      inserted_at: Timex.shift(DateTime.utc_now(), days: -11)
    )

    assert 10 == Discovery.prune_events(10)
    assert 0 == DiscoveryEvent |> Trento.Repo.all() |> length()
  end

  test "should delete discarded events older than the specified days" do
    insert_list(
      10,
      :discarded_discovery_event,
      inserted_at: Timex.shift(DateTime.utc_now(), days: -11)
    )

    assert 10 == Discovery.prune_discarded_discovery_events(10)
    assert 0 == DiscardedDiscoveryEvent |> Trento.Repo.all() |> length()
  end

  test "should discard discovery events with invalid payload" do
    event = %{
      "agent_id" => "invalid_uuid",
      "discovery_type" => "host_discovery",
      "payload" => %{"key" => "value"}
    }

    {:error, _} = Discovery.handle(event)

    discarded_events = Trento.Repo.all(DiscardedDiscoveryEvent)

    [
      %DiscardedDiscoveryEvent{payload: ^event}
    ] = discarded_events
  end

  test "should discard discovery events when the dispatch action fails" do
    error = :any_error

    event = %{
      "agent_id" => Faker.UUID.v4(),
      "discovery_type" => "host_discovery",
      "payload" => build(:host_discovery_event)
    }

    expect(Trento.Commanded.Mock, :dispatch, fn _ ->
      {:error, error}
    end)

    {:error, ^error} = Discovery.handle(event)

    [discarded_event] = Trento.Repo.all(DiscardedDiscoveryEvent)

    assert %DiscardedDiscoveryEvent{payload: ^event} =
             discarded_event
  end

  test "should continue accumulating discovery events if the first command fails" do
    error = :any_error

    sap_discovery_payload_entry =
      "sap_system_discovery_application"
      |> load_discovery_event_fixture()
      |> Map.get("payload")
      |> Enum.at(0)

    event = %{
      "agent_id" => Faker.UUID.v4(),
      "discovery_type" => "sap_system_discovery",
      "payload" => [sap_discovery_payload_entry, sap_discovery_payload_entry]
    }

    Trento.Commanded.Mock
    |> expect(:dispatch, 1, fn _ -> {:error, error} end)
    |> expect(:dispatch, 1, fn _ -> :ok end)

    {:error, [^error]} = Discovery.handle(event)

    [discarded_event] = Trento.Repo.all(DiscardedDiscoveryEvent)

    assert %DiscardedDiscoveryEvent{payload: ^event} =
             discarded_event
  end

  describe "request discovery" do
    test "should request saptune discovery" do
      %{id: host_id} = build(:host)

      discovery_requested = %DiscoveryRequested{
        discovery_type: "saptune_discovery",
        targets: [host_id]
      }

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, "agents", ^discovery_requested ->
          :ok
        end
      )

      assert :ok == Discovery.request_saptune_discovery(host_id)
    end

    test "should handle publishing error on saptune discovery request" do
      %{id: host_id} = build(:host)

      discovery_requested = %DiscoveryRequested{
        discovery_type: "saptune_discovery",
        targets: [host_id]
      }

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, "agents", ^discovery_requested ->
          {:error, "error"}
        end
      )

      assert {:error, "error"} == Discovery.request_saptune_discovery(host_id)
    end
  end
end

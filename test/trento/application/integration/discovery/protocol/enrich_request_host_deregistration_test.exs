defmodule Trento.EnrichRequestHostDeregistrationTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Domain.Commands.RequestHostDeregistration
  alias Trento.Support.Middleware.Enrichable

  describe "enrich RequestHostDeregistration" do
    test "should return the original command if a host with critical health is requested to be deregistered" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)
      insert(:heartbeat, agent_id: id, timestamp: DateTime.add(DateTime.utc_now(), -30, :second))

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:ok, %RequestHostDeregistration{host_id: id, requested_at: now}} ==
               Enrichable.enrich(command, %{})
    end

    test "should return the original command if a host with unknown health is requested to be deregistered after debounce" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:ok, %RequestHostDeregistration{host_id: id, requested_at: now}} ==
               Enrichable.enrich(command, %{})
    end

    test "should return an error if a host with critical health is requested to be deregistered before debounce timer" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)
      insert(:heartbeat, agent_id: id, timestamp: DateTime.add(DateTime.utc_now(), -6, :second))

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:error, :host_alive} == Enrichable.enrich(command, %{})
    end

    test "should return an error if a host with passing health is requested to be deregistered" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)
      insert(:heartbeat, agent_id: id, timestamp: DateTime.add(DateTime.utc_now(), -1, :second))

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:error, :host_alive} == Enrichable.enrich(command, %{})
    end

    test "should return error if host does not exist" do
      command =
        RequestHostDeregistration.new!(%{host_id: UUID.uuid4(), requested_at: DateTime.utc_now()})

      assert {:error, :host_not_registered} == Enrichable.enrich(command, %{})
    end
  end
end

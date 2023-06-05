defmodule Trento.EnrichRequestHostDeregistrationTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Domain.Commands.RequestHostDeregistration
  alias Trento.Support.Middleware.Enrichable

  describe "enrich RequestHostDeregistration" do
    test "should deregister host if deregistration request is outside debounce period" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)
      insert(:heartbeat, agent_id: id, timestamp: DateTime.add(DateTime.utc_now(), -30, :second))

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:ok, %RequestHostDeregistration{host_id: id, requested_at: now}} ==
               Enrichable.enrich(command, %{})
    end

    test "should deregister host if host does not have a heartbeat entry" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:ok, %RequestHostDeregistration{host_id: id, requested_at: now}} ==
               Enrichable.enrich(command, %{})
    end

    test "should return an error if deregistration request is within debounce period" do
      now = DateTime.utc_now()

      %{id: id} = insert(:host)
      insert(:heartbeat, agent_id: id, timestamp: DateTime.add(DateTime.utc_now(), -6, :second))

      command = RequestHostDeregistration.new!(%{host_id: id, requested_at: now})

      assert {:error, :host_alive} == Enrichable.enrich(command, %{})
    end

    test "should return an error if host does not exist" do
      command =
        RequestHostDeregistration.new!(%{host_id: UUID.uuid4(), requested_at: DateTime.utc_now()})

      assert {:error, :host_not_registered} == Enrichable.enrich(command, %{})
    end
  end
end

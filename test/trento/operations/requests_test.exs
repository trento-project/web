defmodule Trento.Operations.RequestsTest do
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Abilities.Ability
  alias Trento.Infrastructure.Operations.AMQP.Publisher
  alias Trento.Operations.Requests
  alias Trento.Operations.V1.OperationRequested

  setup :verify_on_exit!

  describe "schedulable operations" do
    test "should accept the operations that can be scheduled" do
      for {target_type, operation} <- [
            host: :reboot,
            cluster: :cluster_maintenance_change,
            sap_system: :sap_system_start,
            sap_system: :sap_system_stop,
            sap_system: :sap_instance_start,
            sap_system: :sap_instance_stop,
            database: :database_start,
            database: :database_stop
          ] do
        assert Requests.schedulable?(target_type, operation)
      end
    end

    test "should refuse the operations that cannot be scheduled" do
      for {target_type, operation} <- [
            host: :saptune_solution_apply,
            host: :saptune_solution_change,
            cluster: :cluster_resource_refresh,
            cluster: :pacemaker_enable,
            host: :database_start,
            unknown: :reboot
          ] do
        refute Requests.schedulable?(target_type, operation)
      end
    end
  end

  describe "parsing" do
    test "should turn a schedulable operation given as strings into atoms" do
      assert {:ok, :sap_system, :sap_instance_stop} ==
               Requests.parse("sap_system", "sap_instance_stop")
    end

    test "should refuse what cannot be scheduled" do
      for {target_type, operation} <- [
            {"host", "saptune_solution_apply"},
            {"cluster", "reboot"},
            {"nowhere", "reboot"},
            {"host", "not_an_operation"}
          ] do
        assert :error == Requests.parse(target_type, operation)
      end
    end
  end

  describe "operation params" do
    test "should keep only the params of the operation, with atom keys" do
      assert %{maintenance: true, resource_id: "rsc_1"} ==
               Requests.cast_params(:cluster_maintenance_change, %{
                 "maintenance" => true,
                 "resource_id" => "rsc_1",
                 "unexpected" => "value"
               })

      assert %{site: "Site1", timeout: 300} ==
               Requests.cast_params(:database_start, %{site: "Site1", timeout: 300})

      assert %{} == Requests.cast_params(:reboot, %{"timeout" => 1})
    end
  end

  describe "authorization" do
    test "should authorize an operation whose policies pass" do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

      assert :ok == Requests.authorize(:host, host_id, :reboot, %{})
    end

    test "should return the policy errors of an operation that cannot be requested now" do
      %{id: host_id} = insert(:host, heartbeat: :critical, cluster_id: nil)

      assert {:error, :forbidden,
              [%{message: "Trento agent is not currently running in the host"}]} =
               Requests.authorize(:host, host_id, :reboot, %{})
    end

    test "should check the policies of every target type" do
      %{id: cluster_id} = insert(:cluster)

      assert {:error, :forbidden,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the cluster"
                }
              ]} =
               Requests.authorize(:cluster, cluster_id, :cluster_maintenance_change, %{
                 "maintenance" => true
               })
    end

    test "should not find unknown targets" do
      for {target_type, operation, params} <- [
            {:host, :reboot, %{}},
            {:cluster, :cluster_maintenance_change, %{maintenance: true}},
            {:sap_system, :sap_system_start, %{}},
            {:sap_system, :sap_instance_start, %{host_id: UUID.uuid4(), instance_number: "00"}},
            {:database, :database_start, %{}}
          ] do
        assert {:error, :not_found} ==
                 Requests.authorize(target_type, UUID.uuid4(), operation, params)
      end
    end

    test "should not find an SAP instance that is not part of the SAP system" do
      %{id: sap_system_id} = insert(:sap_system)

      assert {:error, :not_found} ==
               Requests.authorize(:sap_system, sap_system_id, :sap_instance_start, %{
                 "host_id" => UUID.uuid4(),
                 "instance_number" => "00"
               })
    end
  end

  describe "requests" do
    test "should request an operation whose policies pass" do
      %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: nil)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "requests",
                                                                        %OperationRequested{
                                                                          operation_type:
                                                                            "hostreboot@v1"
                                                                        } ->
        :ok
      end)

      assert {:ok, operation_id} = Requests.request(:host, host_id, :reboot, %{})
      assert {:ok, _} = UUID.info(operation_id)
    end

    test "should not request an operation whose policies fail" do
      %{id: host_id} = insert(:host, heartbeat: :critical, cluster_id: nil)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert {:error, :forbidden, [_]} = Requests.request(:host, host_id, :reboot, %{})
    end
  end

  describe "abilities" do
    test "should allow a user with the ability of the operation" do
      %{id: user_id} = insert(:user)
      %{id: ability_id} = Repo.get_by!(Ability, name: "reboot", resource: "host")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)
      user = Repo.preload(Repo.get!(Trento.Users.User, user_id), :abilities)

      assert Requests.allowed?(user, :host, :reboot)
      refute Requests.allowed?(user, :cluster, :cluster_maintenance_change)
    end
  end
end

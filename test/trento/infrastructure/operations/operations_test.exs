defmodule Trento.Infrastructure.Operations.OperationsTest do
  @moduledoc false

  use ExUnit.Case

  import Mox

  alias Trento.Infrastructure.Operations

  alias Trento.Operations.V1.{
    OperationRequested,
    OperationTarget
  }

  alias Trento.Infrastructure.Operations.AMQP.Publisher

  describe "request operation" do
    test "should publish an OperationRequested event" do
      operation_id = UUID.uuid4()
      group_id = UUID.uuid4()
      operation = "testoperation"

      agent_id_1 = UUID.uuid4()
      agent_id_2 = UUID.uuid4()

      targets = [
        %{
          agent_id: agent_id_1,
          arguments: %{
            "string" => "some_string",
            :some_atom => :some_value
          }
        },
        %{
          agent_id: agent_id_2,
          arguments: %{
            "integer" => 10,
            "boolean" => true,
            "nil" => nil
          }
        }
      ]

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "requests",
                                                                        event ->
        assert %OperationRequested{
                 operation_id: ^operation_id,
                 group_id: ^group_id,
                 operation_type: ^operation,
                 targets: [
                   %OperationTarget{
                     agent_id: ^agent_id_1,
                     arguments: %{
                       "string" => %{kind: {:string_value, "some_string"}},
                       "some_atom" => %{kind: {:string_value, "some_value"}}
                     }
                   },
                   %OperationTarget{
                     agent_id: ^agent_id_2,
                     arguments: %{
                       "integer" => %{kind: {:number_value, 10}},
                       "boolean" => %{kind: {:bool_value, true}},
                       "nil" => %{kind: {:null_value, :NULL_VALUE}}
                     }
                   }
                 ]
               } = event

        :ok
      end)

      assert :ok =
               Operations.request_operation(
                 operation_id,
                 group_id,
                 operation,
                 targets
               )
    end

    test "should return messaging error" do
      operation_id = UUID.uuid4()
      group_id = UUID.uuid4()
      operation = "testoperation"

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "requests",
                                                                        _ ->
        {:error, :amqp_error}
      end)

      assert {:error, :amqp_error} =
               Operations.request_operation(
                 operation_id,
                 group_id,
                 operation,
                 []
               )
    end
  end

  describe "map operation" do
    test "should map the internal operation type to a known name" do
      operations = [
        %{
          operation_type: :unknown,
          internal_type: "unknown"
        },
        %{
          operation_type: :saptune_solution_apply,
          internal_type: "saptuneapplysolution@v1"
        },
        %{
          operation_type: :saptune_solution_change,
          internal_type: "saptunechangesolution@v1"
        },
        %{
          operation_type: :cluster_maintenance_change,
          internal_type: "clustermaintenancechange@v1"
        },
        %{
          operation_type: :sap_instance_start,
          internal_type: "sapinstancestart@v1"
        },
        %{
          operation_type: :sap_instance_stop,
          internal_type: "sapinstancestop@v1"
        },
        %{
          operation_type: :sap_system_start,
          internal_type: "sapsystemstart@v1"
        },
        %{
          operation_type: :sap_system_stop,
          internal_type: "sapsystemstop@v1"
        },
        %{
          operation_type: :pacemaker_enable,
          internal_type: "pacemakerenable@v1"
        },
        %{
          operation_type: :pacemaker_disable,
          internal_type: "pacemakerdisable@v1"
        },
        %{
          operation_type: :database_start,
          internal_type: "databasestart@v1"
        },
        %{
          operation_type: :database_stop,
          internal_type: "databasestop@v1"
        },
        %{
          operation_type: :reboot,
          internal_type: "hostreboot@v1"
        }
      ]

      for %{operation_type: operation_type, internal_type: internal_type} <- operations do
        assert operation_type == Operations.map_operation_type(internal_type)
      end
    end

    test "should map operation name to correct operator" do
      operations = [
        %{
          operation: :foo,
          operator_name: :unknown
        },
        %{
          operation: :saptune_solution_apply,
          operator_name: "saptuneapplysolution@v1"
        },
        %{
          operation: :saptune_solution_change,
          operator_name: "saptunechangesolution@v1"
        },
        %{
          operation: :cluster_maintenance_change,
          operator_name: "clustermaintenancechange@v1"
        },
        %{
          operation: :sap_instance_start,
          operator_name: "sapinstancestart@v1"
        },
        %{
          operation: :sap_instance_stop,
          operator_name: "sapinstancestop@v1"
        },
        %{
          operation: :sap_system_start,
          operator_name: "sapsystemstart@v1"
        },
        %{
          operation: :sap_system_stop,
          operator_name: "sapsystemstop@v1"
        },
        %{
          operation: :pacemaker_enable,
          operator_name: "pacemakerenable@v1"
        },
        %{
          operation: :pacemaker_disable,
          operator_name: "pacemakerdisable@v1"
        },
        %{
          operation: :database_start,
          operator_name: "databasestart@v1"
        },
        %{
          operation: :database_stop,
          operator_name: "databasestop@v1"
        },
        %{
          operation: :reboot,
          operator_name: "hostreboot@v1"
        }
      ]

      for %{operation: operation, operator_name: operator_name} <- operations do
        assert operator_name == Operations.map_operation(operation)
      end
    end
  end
end

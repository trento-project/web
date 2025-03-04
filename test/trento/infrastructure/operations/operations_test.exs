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

  describe "map operation type" do
    test "should map the internal operation type to a known name" do
      operations = [
        %{
          operation_type: :unknown,
          internal_type: "unknown"
        },
        %{
          operation_type: :saptune_solution_apply,
          internal_type: "saptuneapplysolution@v1"
        }
      ]

      for %{operation_type: operation_type, internal_type: internal_type} <- operations do
        assert operation_type == Operations.map_operation_type(internal_type)
      end
    end
  end
end

defmodule Trento.Infrastructure.Operations do
  @moduledoc """
  Operations integration
  """

  alias Trento.Operations.V1.{
    OperationRequested,
    OperationTarget
  }

  alias Trento.Infrastructure.Messaging

  alias Trento.Infrastructure.Operations.AMQP.Publisher

  alias Trento.Support.Protobuf

  require Logger

  @type operation_target :: %{
          agent_id: String.t(),
          arguments: map()
        }

  @spec request_operation(String.t(), String.t(), String.t(), [operation_target()]) ::
          :ok | {:error, any}
  def request_operation(operation_id, group_id, operation, targets) do
    operation_requested = %OperationRequested{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: operation,
      targets:
        Enum.map(targets, fn %{agent_id: agent_id, arguments: arguments} ->
          %OperationTarget{agent_id: agent_id, arguments: Protobuf.from_map(arguments)}
        end)
    }

    case Messaging.publish(Publisher, "requests", operation_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish message to topic operations: #{inspect(reason)}")

        error
    end
  end

  def map_operation_type("saptuneapplysolution@v1"), do: :saptune_solution_apply
  def map_operation_type("saptunechangesolution@v1"), do: :saptune_solution_change
  def map_operation_type("clustermaintenancechange@v1"), do: :cluster_maintenance_change
  def map_operation_type("sapinstancestart@v1"), do: :sap_instance_start
  def map_operation_type("sapinstancestop@v1"), do: :sap_instance_stop
  def map_operation_type("sapsystemstart@v1"), do: :sap_system_start
  def map_operation_type("sapsystemstop@v1"), do: :sap_system_stop
  def map_operation_type("pacemakerenable@v1"), do: :pacemaker_enable
  def map_operation_type("pacemakerdisable@v1"), do: :pacemaker_disable
  def map_operation_type("crmclusterstart@v1"), do: :cluster_host_start
  def map_operation_type("crmclusterstop@v1"), do: :cluster_host_stop
  def map_operation_type("databasestart@v1"), do: :database_start
  def map_operation_type("databasestop@v1"), do: :database_stop
  def map_operation_type(_), do: :unknown

  def map_operation(:saptune_solution_apply), do: "saptuneapplysolution@v1"
  def map_operation(:saptune_solution_change), do: "saptunechangesolution@v1"
  def map_operation(:cluster_maintenance_change), do: "clustermaintenancechange@v1"
  def map_operation(:cluster_host_start), do: "crmclusterstart@v1"
  def map_operation(:cluster_host_stop), do: "crmclusterstop@v1"
  def map_operation(:sap_instance_start), do: "sapinstancestart@v1"
  def map_operation(:sap_instance_stop), do: "sapinstancestop@v1"
  def map_operation(:sap_system_start), do: "sapsystemstart@v1"
  def map_operation(:sap_system_stop), do: "sapsystemstop@v1"
  def map_operation(:pacemaker_enable), do: "pacemakerenable@v1"
  def map_operation(:pacemaker_disable), do: "pacemakerdisable@v1"
  def map_operation(:database_start), do: "databasestart@v1"
  def map_operation(:database_stop), do: "databasestop@v1"
  def map_operation(_), do: :unknown
end

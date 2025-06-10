defmodule Trento.Operations.ApplicationInstancePolicy do
  @moduledoc """
  ApplicationInstanceReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Enums.Health, as: Health

  alias Trento.Support.OperationsHelper

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # maintenance operation authorized when:
  # - instance is not running
  # - cluster is in maintenance
  def authorize_operation(
        :maintenance,
        %ApplicationInstanceReadModel{} = application_instance,
        params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      instance_running(application_instance),
      cluster_maintenance(application_instance, params)
    ])
  end

  def authorize_operation(operation, %ApplicationInstanceReadModel{}, _)
      when operation in [:sap_instance_start, :sap_instance_stop] do
    :ok
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp instance_running(%ApplicationInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         health: health
       })
       when health != Health.unknown(),
       do: {:error, ["Instance #{instance_number} of SAP system #{sid} is not stopped"]}

  defp instance_running(_), do: :ok

  defp cluster_maintenance(%ApplicationInstanceReadModel{host: %HostReadModel{cluster: nil}}, _),
    do: :ok

  defp cluster_maintenance(
         %ApplicationInstanceReadModel{host: %HostReadModel{cluster: cluster}},
         params
       ),
       do: ClusterReadModel.authorize_operation(:maintenance, cluster, params)
end

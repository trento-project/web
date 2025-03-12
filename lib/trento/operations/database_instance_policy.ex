defmodule Trento.Operations.DatabaseInstancePolicy do
  @moduledoc """
  DatabaseInstanceReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Enums.Health, as: Health

  alias Trento.Support.OperationsHelper

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel

  # maintenance operation authorized when:
  # - instance is not running
  # - cluster is in maintenance
  def authorize_operation(
        :maintenance,
        %DatabaseInstanceReadModel{} = application_instance,
        params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      instance_running(application_instance),
      cluster_maintenance(application_instance, params)
    ])
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp instance_running(%DatabaseInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         health: health
       })
       when health != Health.unknown(),
       do: {:error, ["Instance #{instance_number} of HANA database #{sid} is not stopped"]}

  defp instance_running(_), do: :ok

  defp cluster_maintenance(%DatabaseInstanceReadModel{host: %HostReadModel{cluster: nil}}, _),
    do: :ok

  defp cluster_maintenance(
         %DatabaseInstanceReadModel{host: %HostReadModel{cluster: cluster}},
         params
       ),
       do: ClusterReadModel.authorize_operation(:maintenance, cluster, params)
end

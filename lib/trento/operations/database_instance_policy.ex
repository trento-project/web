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
        _params
      ) do
    OperationsHelper.reduce_operation_authorizations([
      instance_running(application_instance),
      cluster_maintenance(application_instance)
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

  defp cluster_maintenance(%DatabaseInstanceReadModel{host: %HostReadModel{cluster: nil}}),
    do: :ok

  defp cluster_maintenance(%DatabaseInstanceReadModel{
         sid: sid,
         instance_number: instance_number,
         host: %{cluster: %{sap_instances: sap_instances} = cluster}
       }) do
    is_clustered =
      Enum.any?(sap_instances, fn
        %{sid: ^sid, instance_number: ^instance_number} -> true
        _ -> false
      end)

    if is_clustered do
      resource_id = get_cluster_resource_id(cluster)

      ClusterReadModel.authorize_operation(:maintenance, cluster, %{
        cluster_resource_id: resource_id
      })
    else
      :ok
    end
  end

  defp get_cluster_resource_id(%ClusterReadModel{
         details: %{nodes: nodes}
       }) do
    Enum.find_value(nodes, nil, fn %{resources: resources} ->
      Enum.find_value(resources, nil, &find_resource_id/1)
    end)
  end

  defp get_cluster_resource_id(_), do: nil

  # Classic SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHana", parent: %{id: id}}), do: id
  # Angi SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHanaController", parent: %{id: id}}), do: id
  defp find_resource_id(_), do: nil
end

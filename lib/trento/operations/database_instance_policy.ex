defmodule Trento.Operations.DatabaseInstancePolicy do
  @moduledoc """
  DatabaseInstanceReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel

  def authorize_operation(
        :cluster_maintenance,
        %DatabaseInstanceReadModel{host: %HostReadModel{cluster: nil}},
        _params
      ),
      do: :ok

  def authorize_operation(
        :cluster_maintenance,
        %DatabaseInstanceReadModel{
          sid: sid,
          instance_number: instance_number,
          host: %{cluster: %{sap_instances: sap_instances} = cluster}
        },
        _params
      ) do
    is_clustered? =
      Enum.any?(sap_instances, fn
        %{sid: ^sid, instance_number: ^instance_number} -> true
        _ -> false
      end)

    if is_clustered? do
      resource_id = get_cluster_resource_id(cluster)

      ClusterReadModel.authorize_operation(:maintenance, cluster, %{
        cluster_resource_id: resource_id
      })
    else
      :ok
    end
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp get_cluster_resource_id(%ClusterReadModel{
         details: %{resources: resources}
       }) do
    Enum.find_value(resources, nil, &find_resource_id/1)
  end

  defp get_cluster_resource_id(_), do: nil

  # Classic SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHana", parent: %{id: id}}), do: id
  # Angi SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHanaController", parent: %{id: id}}), do: id
  defp find_resource_id(_), do: nil
end

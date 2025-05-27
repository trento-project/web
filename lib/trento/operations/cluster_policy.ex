defmodule Trento.Operations.ClusterPolicy do
  @moduledoc """
  ClusterReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Clusters

  alias Trento.Clusters.Projections.ClusterReadModel

  # maintenance operation authorized when:
  # - cluster is in maintenance
  # - cluster resource is not managed
  def authorize_operation(
        :maintenance,
        %ClusterReadModel{name: name} = cluster,
        %{cluster_resource_id: nil}
      ) do
    if Clusters.maintenance?(cluster) do
      :ok
    else
      {:error, ["Cluster #{name} operating this host is not in maintenance mode"]}
    end
  end

  def authorize_operation(
        :maintenance,
        %ClusterReadModel{name: name} = cluster,
        %{cluster_resource_id: cluster_resource_id}
      ) do
    if Enum.any?([
         Clusters.maintenance?(cluster),
         not Clusters.resource_managed?(cluster, cluster_resource_id)
       ]) do
      :ok
    else
      {:error,
       [
         "Cluster #{name} or resource #{cluster_resource_id} operating this host are not in maintenance mode"
       ]}
    end
  end

  def authorize_operation(:cluster_maintenance_change, _, _), do: :ok

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}
end

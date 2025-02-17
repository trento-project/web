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
        %ClusterReadModel{} = cluster,
        %{cluster_resource_id: nil}
      ),
      do: Clusters.maintenance?(cluster)

  def authorize_operation(
        :maintenance,
        %ClusterReadModel{} = cluster,
        %{cluster_resource_id: cluster_resource_id}
      ) do
    Enum.any?([
      Clusters.maintenance?(cluster),
      not Clusters.resource_managed?(cluster, cluster_resource_id)
    ])
  end

  def authorize_operation(_, _, _), do: false
end

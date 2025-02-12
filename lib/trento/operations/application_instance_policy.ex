defmodule Trento.Operations.ApplicationInstancePolicy do
  @moduledoc """
  ApplicationInstanceReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # maintenance operation authorized when:
  # - instance is not running
  # - cluster is in maintenance
  def authorize_operation(
        :maintenance,
        %ApplicationInstanceReadModel{health: health},
        _
      )
      when health != Health.unknown(),
      do: false

  def authorize_operation(
        :maintenance,
        %ApplicationInstanceReadModel{host: %HostReadModel{cluster: nil}},
        _
      ),
      do: true

  def authorize_operation(
        :maintenance,
        %ApplicationInstanceReadModel{host: %HostReadModel{cluster: cluster}},
        %{cluster_resource_id: _cluster_resource_id} = params
      ) do
    ClusterReadModel.authorize_operation(:maintenance, cluster, params)
  end

  def authorize_operation(_, _, _), do: false
end

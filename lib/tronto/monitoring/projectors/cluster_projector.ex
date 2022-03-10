defmodule Tronto.Monitoring.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "cluster_projector"

  import Tronto.Support.DataMapper

  alias Tronto.Monitoring.Domain.Events.{
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered,
    HostAddedToCluster
  }

  alias Tronto.Monitoring.{
    ClusterReadModel,
    HostReadModel
  }

  alias Tronto.Repo

  project(
    %ClusterRegistered{
      cluster_id: id,
      name: name,
      sid: sid,
      type: type
    },
    fn multi ->
      changeset =
        %ClusterReadModel{}
        |> ClusterReadModel.changeset(%{
          id: id,
          name: name,
          sid: sid,
          type: type,
          health: :unknown
        })

      Ecto.Multi.insert(multi, :cluster, changeset)
    end
  )

  project(
    %ClusterDetailsUpdated{
      cluster_id: id,
      name: name,
      sid: sid,
      type: type
    },
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get(id)
        |> ClusterReadModel.changeset(%{
          name: name,
          sid: sid,
          type: type
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ChecksSelected{
      cluster_id: id,
      checks: checks
    },
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get(id)
        |> ClusterReadModel.changeset(%{
          selected_checks: checks
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, fn multi ->
    changeset =
      ClusterReadModel
      |> Repo.get(cluster_id)
      |> ClusterReadModel.changeset(%{health: health})

    Ecto.Multi.update(multi, :cluster, changeset)
  end)

  project(
    %HostAddedToCluster{
      host_id: id,
      cluster_id: cluster_id
    },
    fn multi ->
      changeset =
        %HostReadModel{}
        |> HostReadModel.changeset(%{
          id: id,
          cluster_id: cluster_id
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace, [:cluster_id]},
        conflict_target: [:id]
      )
    end
  )

  @impl true
  def after_update(
        %ClusterRegistered{},
        _,
        %{cluster: cluster}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_registered",
      cluster |> Repo.preload(:checks_results) |> to_map()
    )
  end

  def after_update(
        %ClusterDetailsUpdated{},
        _,
        %{cluster: cluster}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_details_updated",
      to_map(cluster)
    )
  end

  def after_update(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, _, _) do
    TrontoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_health_changed", %{
      cluster_id: cluster_id,
      health: health
    })
  end

  def after_update(
        %HostAddedToCluster{},
        _,
        %{host: host}
      ) do
    %HostReadModel{id: id, cluster_id: cluster_id, cluster: cluster} =
      Repo.preload(host, :cluster)

    TrontoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      %{
        id: id,
        cluster_id: cluster_id,
        cluster: to_map(cluster)
      }
    )
  end

  def after_update(_, _, _), do: :ok
end

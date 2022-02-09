defmodule Tronto.Monitoring.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "cluster_projector"

  alias Tronto.Monitoring.Domain.Events.{
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered
  }

  alias Tronto.Monitoring.ClusterReadModel

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

  @impl true
  def after_update(
        %ClusterRegistered{},
        _,
        %{cluster: cluster}
      ) do
    TrontoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_registered", cluster)
  end

  def after_update(
        %ClusterDetailsUpdated{},
        _,
        %{cluster: cluster}
      ) do
    TrontoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_details_updated", cluster)
  end

  def after_update(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, _, _) do
    TrontoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_health_changed", %{
      cluster_id: cluster_id,
      health: health
    })
  end

  def after_update(_, _, _), do: :ok
end

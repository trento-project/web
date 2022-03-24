defmodule Trento.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "cluster_projector"

  import Trento.Support.StructHelper

  alias Trento.Domain.Events.{
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered
  }

  alias Trento.ClusterReadModel

  alias Trento.Repo

  project(
    %ClusterRegistered{
      cluster_id: id,
      name: name,
      sid: sid,
      type: type,
      details: details
    },
    fn multi ->
      changeset =
        %ClusterReadModel{}
        |> ClusterReadModel.changeset(%{
          id: id,
          name: name,
          sid: sid,
          type: type,
          details: details,
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
      type: type,
      details: details
    },
    fn multi ->
      changeset =
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          name: name,
          sid: sid,
          type: type,
          details: details
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
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          selected_checks: checks
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, fn multi ->
    changeset =
      %ClusterReadModel{id: cluster_id}
      |> ClusterReadModel.changeset(%{health: health})

    Ecto.Multi.update(multi, :cluster, changeset)
  end)

  @impl true
  def after_update(
        %ClusterRegistered{},
        _,
        %{cluster: cluster}
      ) do
    TrentoWeb.Endpoint.broadcast(
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
    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_details_updated",
      to_map(cluster)
    )
  end

  def after_update(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, _, _) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_health_changed", %{
      cluster_id: cluster_id,
      health: health
    })
  end

  def after_update(_, _, _), do: :ok
end

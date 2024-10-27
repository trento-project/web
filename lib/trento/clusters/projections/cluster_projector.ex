defmodule Trento.Clusters.Projections.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  require Logger

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "cluster_projector"

  alias TrentoWeb.V2.ClusterJSON

  alias Trento.Clusters.Events.{
    ChecksSelected,
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterRestored
  }

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Repo

  import Trento.Clusters, only: [enrich_cluster_model: 1]

  project(
    %ClusterRegistered{
      cluster_id: id,
      name: name,
      sid: sid,
      additional_sids: additional_sids,
      provider: provider,
      type: type,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details,
      health: health
    },
    fn multi ->
      changeset =
        ClusterReadModel.changeset(%ClusterReadModel{}, %{
          id: id,
          name: name,
          sid: sid,
          additional_sids: additional_sids,
          provider: provider,
          type: type,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health: health
        })

      Ecto.Multi.insert(multi, :cluster, changeset)
    end
  )

  project(
    %ClusterDeregistered{
      cluster_id: cluster_id,
      deregistered_at: deregistered_at
    },
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get!(cluster_id)
        |> ClusterReadModel.changeset(%{
          deregistered_at: deregistered_at
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ClusterRestored{
      cluster_id: cluster_id
    },
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get!(cluster_id)
        |> ClusterReadModel.changeset(%{
          deregistered_at: nil
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ClusterDetailsUpdated{
      cluster_id: id,
      name: name,
      sid: sid,
      additional_sids: additional_sids,
      provider: provider,
      type: type,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details
    },
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get!(id)
        |> ClusterReadModel.changeset(%{
          name: name,
          sid: sid,
          additional_sids: additional_sids,
          provider: provider,
          type: type,
          resources_number: resources_number,
          hosts_number: hosts_number,
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
      |> Repo.get!(cluster_id)
      |> ClusterReadModel.changeset(%{health: health})

    Ecto.Multi.update(multi, :cluster, changeset)
  end)

  @impl true
  def after_update(
        %ClusterRegistered{},
        _,
        %{cluster: cluster}
      ) do
    registered_cluster = enrich_cluster_model(cluster)

    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_registered",
      ClusterJSON.cluster_registered(%{cluster: registered_cluster})
    )
  end

  @impl true
  def after_update(
        %ClusterDetailsUpdated{} = updated_details,
        _,
        %{cluster: cluster}
      ) do
    # IO.inspect(updated_details, label: "updated_details")
    # IO.inspect(cluster, label: "cluster")
    Logger.warning("ClusterDetailsUpdated #{inspect(updated_details)} -------- #{inspect(cluster)}")

    message =
      ClusterJSON.cluster_details_updated(%{data: updated_details})

    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_details_updated",
      message
    )
  end

  def after_update(%ChecksSelected{cluster_id: cluster_id, checks: checks}, _, _) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_details_updated", %{
      id: cluster_id,
      selected_checks: checks
    })
  end

  def after_update(%ClusterHealthChanged{}, _, %{cluster: %ClusterReadModel{} = cluster}) do
    message = ClusterJSON.cluster_health_changed(%{cluster: cluster})

    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_health_changed", message)
  end

  @impl true
  def after_update(%ClusterDeregistered{cluster_id: cluster_id}, _, %{
        cluster: %ClusterReadModel{name: name}
      }) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_deregistered", %{
      id: cluster_id,
      name: name
    })
  end

  @impl true
  def after_update(%ClusterRestored{cluster_id: cluster_id}, _, _) do
    cluster =
      ClusterReadModel
      |> Repo.get!(cluster_id)
      |> Repo.preload([:tags])

    restored_cluster = enrich_cluster_model(cluster)

    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_restored",
      ClusterJSON.cluster_restored(%{cluster: restored_cluster})
    )
  end

  def after_update(_, _, _), do: :ok
end

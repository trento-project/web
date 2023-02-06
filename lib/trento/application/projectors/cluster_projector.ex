defmodule Trento.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "cluster_projector"

  alias TrentoWeb.ClusterView

  alias Trento.Domain.Events.{
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered
  }

  alias Trento.ClusterReadModel

  alias Trento.Repo

  import Trento.Clusters, only: [enrich_cluster_model: 1]

  project(
    %ClusterRegistered{
      cluster_id: id,
      name: name,
      sid: sid,
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
    %ClusterDetailsUpdated{
      cluster_id: id,
      name: name,
      sid: sid,
      provider: provider,
      type: type,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details
    },
    fn multi ->
      changeset =
        ClusterReadModel.changeset(%ClusterReadModel{id: id}, %{
          name: name,
          sid: sid,
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
        # TODO: couldn't make it work with Ecto.Multi
        # With following line when we receive an empty list of selected checks, the readmodel does not get updated
        # %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          selected_checks: checks
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, fn multi ->
    changeset = ClusterReadModel.changeset(%ClusterReadModel{id: cluster_id}, %{health: health})

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
      ClusterView.render("cluster_registered.json", cluster: registered_cluster)
    )
  end

  @impl true
  def after_update(
        %ClusterDetailsUpdated{} = updated_details,
        _,
        _
      ) do
    message = ClusterView.render("cluster_details_updated.json", data: updated_details)

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

  def after_update(%ClusterHealthChanged{cluster_id: cluster_id, health: health}, _, _) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_health_changed", %{
      cluster_id: cluster_id,
      health: health
    })
  end

  def after_update(_, _, _), do: :ok
end

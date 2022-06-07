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
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRegistered
  }

  alias Trento.ClusterReadModel

  alias Trento.Repo

  import Trento.Clusters, only: [enrich_cluster_model_query: 1]

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
        %ClusterReadModel{}
        |> ClusterReadModel.changeset(%{
          id: id,
          name: name,
          sid: sid,
          provider: provider,
          type: type,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health: health,
          checks_execution: :not_running
        })

      Ecto.Multi.insert(multi, :cluster, changeset)
    end
  )

  project(
    %ChecksExecutionRequested{
      cluster_id: id
    },
    fn multi ->
      changeset =
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          checks_execution: :requested
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ChecksExecutionStarted{
      cluster_id: id
    },
    fn multi ->
      changeset =
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          checks_execution: :running
        })

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ChecksExecutionCompleted{
      cluster_id: id
    },
    fn multi ->
      changeset =
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
          checks_execution: :not_running
        })

      Ecto.Multi.update(multi, :cluster, changeset)
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
        %ClusterReadModel{id: id}
        |> ClusterReadModel.changeset(%{
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
      ClusterReadModel
      |> enrich_cluster_model_query
      |> Repo.get(cluster.id)
      |> Repo.preload(:checks_results)
      |> to_map()
    )
  end

  @impl true
  def after_update(
        %ClusterDetailsUpdated{
          cluster_id: id,
          name: name,
          type: type,
          sid: sid,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_details_updated",
      %{
        id: id,
        name: name,
        type: type,
        sid: sid,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        details: details
      }
    )
  end

  # TODO: broadcast a more specific event
  def after_update(
        %event{},
        _,
        %{cluster: %{id: id, checks_execution: checks_execution}}
      )
      when event in [
             ChecksExecutionRequested,
             ChecksExecutionStarted,
             ChecksExecutionCompleted
           ] do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_details_updated",
      %{
        id: id,
        checks_execution: checks_execution
      }
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

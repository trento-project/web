# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Projections.ClusterProjector do
  @moduledoc """
  Cluster projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "cluster_projector"

  require Trento.Enums.Health, as: Health
  require Trento.Support.HealthValueDetails, as: HealthValueDetails

  alias TrentoWeb.V2.ClusterJSON

  alias Trento.Clusters.Events.{
    ChecksSelected,
    ClusterChecksHealthChanged,
    ClusterDataMarkedInSync,
    ClusterDataMarkedStale,
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterDistributedHealthChanged,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterReplicationHealthChanged,
    ClusterRestored,
    ClusterSbdHealthChanged
  }

  alias Trento.Clusters.Projections.{
    AscsErsClusterHealthDetails,
    ClusterReadModel,
    HanaClusterHealthDetails
  }

  alias Trento.Repo
  alias Trento.Support.StructHelper

  import Trento.Clusters, only: [enrich_cluster_model: 1]

  project(
    %ClusterRegistered{
      cluster_id: id,
      name: name,
      sap_instances: sap_instances,
      provider: provider,
      type: type,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details,
      health: health,
      health_details: health_details,
      state: state
    },
    fn multi ->
      changeset =
        ClusterReadModel.changeset(%ClusterReadModel{}, %{
          id: id,
          name: name,
          sap_instances: StructHelper.to_map(sap_instances),
          provider: provider,
          type: type,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health: health,
          health_details: postprocess_health_details(health_details),
          state: state
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
      sap_instances: sap_instances,
      provider: provider,
      type: type,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details,
      state: state
    },
    fn multi ->
      cluster = Repo.get!(ClusterReadModel, id)

      health_details =
        type
        |> maybe_get_default_health_details(cluster.health_details)
        |> StructHelper.to_map()

      changeset =
        ClusterReadModel.changeset(cluster, %{
          name: name,
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          provider: provider,
          type: type,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health_details: health_details,
          state: state
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

  project(
    %ClusterChecksHealthChanged{cluster_id: cluster_id, checks_health: checks_health},
    fn multi ->
      Ecto.Multi.update_all(
        multi,
        :health_details,
        health_details_update_query(cluster_id, "checks_health", checks_health),
        []
      )
    end
  )

  project(
    %ClusterDistributedHealthChanged{
      cluster_id: cluster_id,
      distributed_health: distributed_health
    },
    fn multi ->
      Ecto.Multi.update_all(
        multi,
        :health_details,
        health_details_update_query(cluster_id, "distributed_health", distributed_health),
        []
      )
    end
  )

  project(
    %ClusterReplicationHealthChanged{
      cluster_id: cluster_id,
      replication_health: replication_health
    },
    fn multi ->
      Ecto.Multi.update_all(
        multi,
        :health_details,
        health_details_update_query(cluster_id, "replication_health", replication_health),
        []
      )
    end
  )

  project(
    %ClusterSbdHealthChanged{cluster_id: cluster_id, sbd_health: sbd_health},
    fn multi ->
      Ecto.Multi.update_all(
        multi,
        :health_details,
        health_details_update_query(cluster_id, "sbd_health", sbd_health),
        []
      )
    end
  )

  project(
    %ClusterDataMarkedStale{cluster_id: cluster_id, stale_at: stale_at},
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get!(cluster_id)
        |> ClusterReadModel.changeset(%{stale_at: stale_at})

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

  project(
    %ClusterDataMarkedInSync{cluster_id: cluster_id},
    fn multi ->
      changeset =
        ClusterReadModel
        |> Repo.get!(cluster_id)
        |> ClusterReadModel.changeset(%{stale_at: nil})

      Ecto.Multi.update(multi, :cluster, changeset)
    end
  )

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
        _
      ) do
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

  @impl true
  def after_update(%ClusterDataMarkedStale{}, _, %{cluster: %ClusterReadModel{} = cluster}) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_stale_changed",
      ClusterJSON.cluster_stale_changed(%{cluster: cluster})
    )
  end

  @impl true
  def after_update(%ClusterDataMarkedInSync{}, _, %{cluster: %ClusterReadModel{} = cluster}) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:clusters",
      "cluster_stale_changed",
      ClusterJSON.cluster_stale_changed(%{cluster: cluster})
    )
  end

  def after_update(_, _, _), do: :ok

  # -- Helpers --

  defp postprocess_health_details(nil), do: nil

  defp postprocess_health_details(health_details) do
    health_details
    |> StructHelper.to_map()
    |> Map.new(&{&1, %{value: &2}})
  end

  defp maybe_get_default_health_details(:ascs_ers, nil),
    do: %AscsErsClusterHealthDetails{
      checks_health: %HealthValueDetails{value: Health.unknown()},
      sbd_health: %HealthValueDetails{value: Health.unknown()},
      distributed_health: %HealthValueDetails{value: Health.unknown()}
    }

  defp maybe_get_default_health_details(new_type, nil)
       when new_type in [:hana_scale_up, :hana_scale_out],
       do: %HanaClusterHealthDetails{
         checks_health: %HealthValueDetails{value: Health.unknown()},
         sbd_health: %HealthValueDetails{value: Health.unknown()},
         replication_health: %HealthValueDetails{value: Health.unknown()}
       }

  defp maybe_get_default_health_details(_new_type, previous_health_details),
    do: previous_health_details

  defp health_details_update_query(cluster_id, value_path, value) do
    from(
      c in ClusterReadModel,
      where: c.id == ^cluster_id,
      update: [
        set: [
          health_details:
            fragment(
              "jsonb_set(?, ARRAY[?::text, 'value'], to_jsonb(?::text), false)",
              c.health_details,
              ^value_path,
              ^to_string(value)
            ),
          updated_at: ^DateTime.utc_now()
        ]
      ]
    )
  end
end

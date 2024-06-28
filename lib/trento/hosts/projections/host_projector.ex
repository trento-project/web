defmodule Trento.Hosts.Projections.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "host_projector"

  alias TrentoWeb.V1.HostView

  alias Trento.Repo

  alias Trento.Clusters.Events.{
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  alias Trento.Hosts.Events.{
    HeartbeatFailed,
    HeartbeatSucceeded,
    HostChecksSelected,
    HostDeregistered,
    HostDetailsUpdated,
    HostHealthChanged,
    HostRegistered,
    HostRestored,
    ProviderUpdated,
    SaptuneStatusUpdated
  }

  alias Trento.Hosts.Projections.HostReadModel

  project(
    %HostRegistered{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      ip_addresses_netmasks: ip_addresses_netmasks,
      agent_version: agent_version,
      fully_qualified_domain_name: fully_qualified_domain_name,
      heartbeat: heartbeat
    },
    fn multi ->
      changeset =
        HostReadModel.changeset(%HostReadModel{id: id}, %{
          hostname: hostname,
          ip_addresses: ip_addresses,
          ip_addresses_netmasks: ip_addresses_netmasks,
          agent_version: agent_version,
          fully_qualified_domain_name: fully_qualified_domain_name,
          heartbeat: heartbeat
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace_all_except, [:cluster_id]},
        conflict_target: [:id],
        returning: true
      )
    end
  )

  project(
    %HostDeregistered{
      host_id: id,
      deregistered_at: deregistered_at
    },
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          deregistered_at: deregistered_at
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HostRestored{
      host_id: id
    },
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          deregistered_at: nil
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HostAddedToCluster{
      host_id: id,
      cluster_id: cluster_id
    },
    fn multi ->
      changeset =
        HostReadModel.changeset(%HostReadModel{id: id}, %{
          cluster_id: cluster_id
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace, [:cluster_id]},
        conflict_target: [:id],
        returning: true
      )
    end
  )

  project(
    %HostRemovedFromCluster{
      host_id: id,
      cluster_id: cluster_id
    },
    fn multi ->
      host = Repo.get!(HostReadModel, id)
      # Only remove the cluster_id if it matches the one in the event
      # We cannot guarantee the order of the events during the delta deregistration,
      # so we need to make sure we don't remove the cluster_id if it has been overwritten by HostAddedToCluster
      if host.cluster_id == cluster_id do
        changeset =
          HostReadModel.changeset(host, %{
            cluster_id: nil
          })

        Ecto.Multi.update(multi, :host, changeset)
      else
        multi
      end
    end
  )

  project(
    %HostDetailsUpdated{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      ip_addresses_netmasks: ip_addresses_netmasks,
      fully_qualified_domain_name: fully_qualified_domain_name,
      agent_version: agent_version
    },
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          hostname: hostname,
          ip_addresses: ip_addresses,
          ip_addresses_netmasks: ip_addresses_netmasks,
          fully_qualified_domain_name: fully_qualified_domain_name,
          agent_version: agent_version
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HostChecksSelected{
      host_id: id,
      checks: checks
    },
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get(id)
        |> HostReadModel.changeset(%{
          selected_checks: checks
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HeartbeatSucceeded{host_id: id},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          heartbeat: :passing
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HeartbeatFailed{host_id: id},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          heartbeat: :critical
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %ProviderUpdated{host_id: id, provider: provider, provider_data: provider_data},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          provider: provider,
          provider_data: map_from_struct(provider_data)
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %SaptuneStatusUpdated{host_id: id, status: status},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          saptune_status: map_from_struct(status)
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HostHealthChanged{host_id: id, health: health},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  def map_from_struct(struct) when is_struct(struct) do
    Map.from_struct(struct)
  end

  def map_from_struct(_), do: nil

  @impl true
  @spec after_update(any, any, any) :: :ok | {:error, any}
  def after_update(
        %HostRegistered{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_registered",
      HostView.render("host_registered.json", host: host)
    )
  end

  def after_update(
        %HostRestored{host_id: id},
        _,
        _
      ) do
    host =
      HostReadModel
      |> Repo.get!(id)
      |> Repo.preload([:sles_subscriptions, :tags])

    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_restored",
      HostView.render("host_restored.json", host: host)
    )
  end

  def after_update(
        %HostDeregistered{host_id: id},
        _,
        %{host: %HostReadModel{hostname: hostname}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_deregistered",
      %{
        id: id,
        hostname: hostname
      }
    )
  end

  def after_update(%HostAddedToCluster{}, _, %{
        host: %HostReadModel{hostname: nil}
      }),
      do: :ok

  def after_update(
        %HostAddedToCluster{host_id: id, cluster_id: cluster_id},
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      %{
        id: id,
        cluster_id: cluster_id
      }
    )
  end

  def after_update(
        %HostRemovedFromCluster{host_id: host_id},
        _,
        %{host: %HostReadModel{cluster_id: nil}}
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", %{
      id: host_id,
      cluster_id: nil
    })
  end

  def after_update(
        %HostDetailsUpdated{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      HostView.render("host_details_updated.json", host: host)
    )
  end

  def after_update(
        %HeartbeatSucceeded{host_id: id},
        _,
        %{host: %HostReadModel{hostname: hostname}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "heartbeat_succeded",
      HostView.render("heartbeat_result.json",
        host: %{
          id: id,
          hostname: hostname
        }
      )
    )
  end

  def after_update(
        %HeartbeatFailed{host_id: id},
        _,
        %{host: %HostReadModel{hostname: hostname}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "heartbeat_failed",
      HostView.render("heartbeat_result.json",
        host: %{
          id: id,
          hostname: hostname
        }
      )
    )
  end

  def after_update(
        %ProviderUpdated{},
        _,
        %{host: %HostReadModel{id: id, provider: provider, provider_data: provider_data}}
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", %{
      id: id,
      provider: provider,
      provider_data: provider_data
    })
  end

  def after_update(
        %HostChecksSelected{checks: checks},
        _,
        %{host: %HostReadModel{selected_checks: checks} = host}
      ) do
    message =
      HostView.render(
        "host_details_updated.json",
        %{host: host}
      )

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", message)
  end

  def after_update(
        %SaptuneStatusUpdated{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    message =
      HostView.render(
        "saptune_status_updated.json",
        %{host: host}
      )

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "saptune_status_updated", message)
  end

  def after_update(
        %HostHealthChanged{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    message = HostView.render("host_health_changed.json", %{host: host})

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_health_changed", message)
  end

  def after_update(_, _, _), do: :ok
end

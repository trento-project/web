defmodule Trento.Hosts.Projections.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "host_projector"

  alias TrentoWeb.V1.HostJSON

  alias Trento.Repo

  alias Trento.Clusters.Events.{
    ClusterHostStatusChanged,
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
      agent_version: agent_version,
      arch: arch,
      fully_qualified_domain_name: fully_qualified_domain_name,
      heartbeat: heartbeat,
      prometheus_targets: prometheus_targets,
      systemd_units: systemd_units
    },
    fn multi ->
      {addresses, netmasks} = parse_address_netmask(ip_addresses)

      changeset =
        HostReadModel.changeset(%HostReadModel{id: id}, %{
          hostname: hostname,
          ip_addresses: addresses,
          netmasks: netmasks,
          agent_version: agent_version,
          arch: arch,
          fully_qualified_domain_name: fully_qualified_domain_name,
          heartbeat: heartbeat,
          prometheus_targets: prometheus_targets,
          systemd_units: map_list_from_struct_list(systemd_units)
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
      cluster_id: cluster_id,
      cluster_host_status: cluster_host_status
    },
    fn multi ->
      changeset =
        HostReadModel.changeset(%HostReadModel{id: id}, %{
          cluster_id: cluster_id,
          cluster_host_status: cluster_host_status
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace, [:cluster_id, :cluster_host_status]},
        conflict_target: [:id],
        returning: true
      )
    end
  )

  project(
    %ClusterHostStatusChanged{
      host_id: id,
      cluster_id: cluster_id,
      cluster_host_status: cluster_host_status
    },
    fn multi ->
      host = Repo.get!(HostReadModel, id)

      changeset =
        HostReadModel.changeset(host, %{
          cluster_id: cluster_id,
          cluster_host_status: cluster_host_status
        })

      Ecto.Multi.update(multi, :host, changeset)
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
            cluster_id: nil,
            cluster_host_status: nil
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
      fully_qualified_domain_name: fully_qualified_domain_name,
      agent_version: agent_version,
      arch: arch,
      prometheus_targets: prometheus_targets,
      systemd_units: systemd_units
    },
    fn multi ->
      {addresses, netmasks} = parse_address_netmask(ip_addresses)

      changeset =
        HostReadModel
        |> Repo.get!(id)
        |> HostReadModel.changeset(%{
          hostname: hostname,
          ip_addresses: addresses,
          netmasks: netmasks,
          fully_qualified_domain_name: fully_qualified_domain_name,
          agent_version: agent_version,
          arch: arch,
          prometheus_targets: prometheus_targets,
          systemd_units: map_list_from_struct_list(systemd_units)
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
      HostJSON.host_registered(%{host: host})
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
      HostJSON.host_restored(%{host: host})
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
        %HostAddedToCluster{
          host_id: id,
          cluster_id: cluster_id,
          cluster_host_status: cluster_host_status
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      %{
        id: id,
        cluster_id: cluster_id,
        cluster_host_status: cluster_host_status
      }
    )
  end

  def after_update(
        %ClusterHostStatusChanged{host_id: id, cluster_host_status: cluster_host_status},
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      %{
        id: id,
        cluster_host_status: cluster_host_status
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
      cluster_id: nil,
      cluster_host_status: nil
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
      HostJSON.host_details_updated(%{host: host})
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
      HostJSON.heartbeat_result(%{
        host: %{
          id: id,
          hostname: hostname
        }
      })
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
      HostJSON.heartbeat_result(%{
        host: %{
          id: id,
          hostname: hostname
        }
      })
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
      HostJSON.host_details_updated(%{host: host})

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", message)
  end

  def after_update(
        %SaptuneStatusUpdated{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    message = HostJSON.saptune_status_updated(%{host: host})

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "saptune_status_updated", message)
  end

  def after_update(
        %HostHealthChanged{},
        _,
        %{host: %HostReadModel{} = host}
      ) do
    message = HostJSON.host_health_changed(%{host: host})

    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_health_changed", message)
  end

  def after_update(_, _, _), do: :ok

  defp map_list_from_struct_list(structs) when is_list(structs) do
    Enum.map(structs, &map_from_struct/1)
  end

  defp map_list_from_struct_list(structs), do: structs

  defp map_from_struct(struct) when is_struct(struct) do
    Map.from_struct(struct)
  end

  defp map_from_struct(_), do: nil

  defp parse_address_netmask(ip_addresses) do
    ip_addresses
    |> Enum.map(fn address ->
      case String.split(address, "/") do
        [ip, mask] -> {ip, String.to_integer(mask)}
        [ip] -> {ip, nil}
      end
    end)
    |> Enum.unzip()
  end
end

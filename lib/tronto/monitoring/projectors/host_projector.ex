defmodule Tronto.Monitoring.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "host_projector"

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostAddedToCluster,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated
  }

  alias Tronto.Monitoring.HostReadModel

  alias Tronto.Repo

  project(
    %HostRegistered{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version,
      heartbeat: heartbeat
    },
    fn multi ->
      changeset =
        %HostReadModel{}
        |> HostReadModel.changeset(%{
          id: id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: heartbeat
        })

      Ecto.Multi.insert(multi, :host, changeset)
    end
  )

  project(
    %HostDetailsUpdated{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    },
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get(id)
        |> HostReadModel.changeset(%{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HeartbeatSucceded{host_id: id},
    fn multi ->
      changeset =
        HostReadModel
        |> Repo.get(id)
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
        |> Repo.get(id)
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
        |> Repo.get(id)
        |> HostReadModel.changeset(%{
          provider: provider,
          provider_data: provider_data
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
        %HostReadModel{}
        |> HostReadModel.changeset(%{
          id: id,
          cluster_id: cluster_id
        })

      Ecto.Multi.insert(multi, :host_added_to_cluster, changeset,
        on_conflict: {:replace, [:cluster_id]},
        conflict_target: [:id]
      )
    end
  )

  @impl true
  def after_update(
        %HostRegistered{},
        _,
        %{host: host}
      ) do
    TrontoWeb.Endpoint.broadcast("monitoring:hosts", "host_registered", host)
  end

  def after_update(
        %HostDetailsUpdated{},
        _,
        %{host: host}
      ) do
    TrontoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", host)
  end

  def after_update(
        %HeartbeatSucceded{},
        _,
        %{host: %HostReadModel{id: id, hostname: hostname}}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "heartbeat_succeded",
      %{
        id: id,
        hostname: hostname
      }
    )
  end

  def after_update(
        %HeartbeatFailed{},
        _,
        %{host: %HostReadModel{id: id, hostname: hostname}}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "heartbeat_failed",
      %{
        id: id,
        hostname: hostname
      }
    )
  end

  def after_update(
        %ProviderUpdated{},
        _,
        %{host: host}
      ) do
    # FIXME: Use a DTO here instead of sending the whole thing
    host =
      HostReadModel
      |> Repo.get(host.id)
      |> Repo.preload(cluster: :checks_results)

    TrontoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", host)
  end

  def after_update(
        %HostAddedToCluster{},
        _,
        %{host_added_to_cluster: host}
      ) do
    # FIXME: Use a DTO here instead of sending the whole thing
    host =
      HostReadModel
      |> Repo.get(host.id)
      |> Repo.preload(cluster: :checks_results)

    TrontoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", host)
  end

  def after_update(_, _, _), do: :ok
end

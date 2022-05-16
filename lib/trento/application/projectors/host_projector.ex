defmodule Trento.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "host_projector"

  import Trento.Support.StructHelper

  alias Trento.Repo

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostAddedToCluster,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated
  }

  alias Trento.HostReadModel

  project(
    %HostRegistered{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      ssh_address: ssh_address,
      agent_version: agent_version,
      heartbeat: heartbeat
    },
    fn multi ->
      changeset =
        %HostReadModel{id: id}
        |> HostReadModel.changeset(%{
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
          agent_version: agent_version,
          heartbeat: heartbeat
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace_all_except, [:cluster_id]},
        conflict_target: [:id]
      )
    end
  )

  project(
    %HostAddedToCluster{
      host_id: id,
      cluster_id: cluster_id
    },
    fn multi ->
      changeset =
        %HostReadModel{id: id}
        |> HostReadModel.changeset(%{
          cluster_id: cluster_id
        })

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: {:replace, [:cluster_id]},
        conflict_target: [:id]
      )
    end
  )

  project(
    %HostDetailsUpdated{
      host_id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      ssh_address: ssh_address,
      agent_version: agent_version
    },
    fn multi ->
      changeset =
        %HostReadModel{id: id}
        |> HostReadModel.changeset(%{
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
          agent_version: agent_version
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  project(
    %HeartbeatSucceded{host_id: id},
    fn multi ->
      changeset =
        %HostReadModel{id: id}
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
        %HostReadModel{id: id}
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
        %HostReadModel{id: id}
        |> HostReadModel.changeset(%{
          provider: provider,
          provider_data: handle_provider_data(provider_data)
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  def handle_provider_data(provider_data) when is_map(provider_data) do
    provider_data |> Map.from_struct()
  end

  def handle_provider_data(_), do: nil

  @impl true
  @spec after_update(any, any, any) :: :ok | {:error, any}
  def after_update(
        %HostRegistered{host_id: id},
        _,
        _
      ) do
    # We need to hit the database to get the cluster_id
    host = Repo.get!(HostReadModel, id)

    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_registered",
      host |> to_map()
    )
  end

  def after_update(
        %HostAddedToCluster{host_id: id, cluster_id: cluster_id},
        _,
        _
      ) do
    case Repo.get!(HostReadModel, id) do
      # In case the host was not registered yet, we don't want to broadcast
      %HostReadModel{hostname: nil} ->
        :ok

      %HostReadModel{} ->
        TrentoWeb.Endpoint.broadcast(
          "monitoring:hosts",
          "host_details_updated",
          %{
            id: id,
            cluster_id: cluster_id
          }
        )
    end
  end

  def after_update(
        %HostDetailsUpdated{},
        _,
        %{host: host}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "host_details_updated",
      host |> to_map() |> Map.delete("cluster_id") |> Map.delete("heartbeat")
    )
  end

  def after_update(
        %HeartbeatSucceded{host_id: id},
        _,
        _
      ) do
    %HostReadModel{hostname: hostname} = Repo.get!(HostReadModel, id)

    TrentoWeb.Endpoint.broadcast(
      "monitoring:hosts",
      "heartbeat_succeded",
      %{
        id: id,
        hostname: hostname
      }
    )
  end

  def after_update(
        %HeartbeatFailed{host_id: id},
        _,
        _
      ) do
    %HostReadModel{hostname: hostname} = Repo.get!(HostReadModel, id)

    TrentoWeb.Endpoint.broadcast(
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
        %{host: %HostReadModel{id: id, provider: provider, provider_data: provider_data}}
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", %{
      id: id,
      provider: provider,
      provider_data: provider_data
    })
  end

  def after_update(_, _, _), do: :ok
end

defmodule Trento.Monitoring.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "host_projector"

  import Trento.Support.StructHelper

  alias Trento.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated
  }

  alias Trento.Monitoring.HostReadModel

  alias Trento.Repo

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

      Ecto.Multi.insert(multi, :host, changeset,
        on_conflict: :replace_all,
        conflict_target: [:id]
      )
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
          provider_data: provider_data |> Map.from_struct() |> Map.put(:provider, provider)
        })

      Ecto.Multi.update(multi, :host, changeset)
    end
  )

  @impl true
  def after_update(
        %HostRegistered{},
        _,
        %{host: host}
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_registered", to_map(host))
  end

  def after_update(
        %HostDetailsUpdated{},
        _,
        %{host: host}
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:hosts", "host_details_updated", to_map(host))
  end

  def after_update(
        %HeartbeatSucceded{},
        _,
        %{host: %HostReadModel{id: id, hostname: hostname}}
      ) do
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
        %HeartbeatFailed{},
        _,
        %{host: %HostReadModel{id: id, hostname: hostname}}
      ) do
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

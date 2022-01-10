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
    HostRegistered
  }

  alias Tronto.Monitoring.HostReadModel

  alias Tronto.Repo

  project(
    %HostRegistered{
      id_host: id,
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
    %HeartbeatSucceded{id_host: id},
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
    %HeartbeatFailed{id_host: id},
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

  @impl true
  def after_update(
        %HostRegistered{},
        _,
        %{host: host}
      ) do
    TrontoWeb.Endpoint.broadcast("hosts:notifications", "host_registered", host)
  end

  def after_update(
        %HeartbeatSucceded{id_host: id_host},
        _,
        %{host: %HostReadModel{hostname: hostname}}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "hosts:notifications",
      "heartbeat_succeded",
      %{
        id_host: id_host,
        hostname: hostname
      }
    )
  end

  def after_update(
        %HeartbeatFailed{id_host: id_host},
        _,
        %{host: %HostReadModel{hostname: hostname}}
      ) do
    TrontoWeb.Endpoint.broadcast(
      "hosts:notifications",
      "heartbeat_failed",
      %{
        id_host: id_host,
        hostname: hostname
      }
    )
  end

  def after_update(_, _, _), do: :ok
end

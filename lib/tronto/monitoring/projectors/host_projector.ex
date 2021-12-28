defmodule Tronto.Monitoring.HostProjector do
  @moduledoc """
  Host projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "host_projector"

  alias Tronto.Monitoring.Domain.Events.HostRegistered
  alias Tronto.Monitoring.HostReadModel

  project(
    %HostRegistered{
      id_host: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    },
    fn multi ->
      changeset =
        %HostReadModel{}
        |> HostReadModel.changeset(%{
          id: id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        })

      Ecto.Multi.insert(multi, :host, changeset)
    end
  )

  @impl true
  def after_update(
        %HostRegistered{
          id_host: id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        },
        _,
        _
      ) do
    Phoenix.PubSub.broadcast(
      Tronto.PubSub,
      "hosts",
      {:host_registered,
       %{
         id: id,
         hostname: hostname,
         ip_addresses: ip_addresses,
         agent_version: agent_version
       }}
    )
  end
end

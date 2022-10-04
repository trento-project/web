defmodule Trento.TelemetryProjector do
  @moduledoc """
  Telemetry projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "telemetry_projector"

  alias Trento.Domain.Events.{
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated
  }

  alias Trento.HostTelemetryReadModel

  project(
    %HostRegistered{
      host_id: agent_id,
      hostname: hostname,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: sles_version,
      installation_source: installation_source
    },
    fn multi ->
      changeset =
        HostTelemetryReadModel.changeset(
          %HostTelemetryReadModel{},
          %{
            agent_id: agent_id,
            hostname: hostname,
            cpu_count: cpu_count,
            socket_count: socket_count,
            total_memory_mb: total_memory_mb,
            sles_version: sles_version,
            installation_source: installation_source
          }
        )

      Ecto.Multi.insert(multi, :host_telemetry, changeset,
        on_conflict: :replace_all,
        conflict_target: [:agent_id]
      )
    end
  )

  project(
    %HostDetailsUpdated{
      host_id: agent_id,
      hostname: hostname,
      cpu_count: cpu_count,
      socket_count: socket_count,
      total_memory_mb: total_memory_mb,
      os_version: sles_version,
      installation_source: installation_source
    },
    fn multi ->
      changeset =
        HostTelemetryReadModel.changeset(%HostTelemetryReadModel{}, %{
          agent_id: agent_id,
          hostname: hostname,
          cpu_count: cpu_count,
          socket_count: socket_count,
          total_memory_mb: total_memory_mb,
          sles_version: sles_version,
          installation_source: installation_source
        })

      Ecto.Multi.insert(multi, :host_telemetry, changeset,
        on_conflict: :replace_all,
        conflict_target: [:agent_id]
      )
    end
  )

  project(
    %ProviderUpdated{
      host_id: agent_id,
      provider: provider
    },
    fn multi ->
      changeset =
        HostTelemetryReadModel.changeset(%HostTelemetryReadModel{}, %{
          agent_id: agent_id,
          provider: provider
        })

      Ecto.Multi.insert(multi, :host_telemetry, changeset,
        on_conflict: :replace_all,
        conflict_target: [:agent_id]
      )
    end
  )
end

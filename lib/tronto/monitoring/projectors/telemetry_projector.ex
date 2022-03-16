defmodule Tronto.Monitoring.TelemetryProjector do
  @moduledoc """
  Telemetry projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "telemetry_projector"

  alias Tronto.Monitoring.Domain.Events.{
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated
  }

  alias Tronto.Monitoring.HostTelemetryReadModel

  project(
    %HostRegistered{
      host_id: agent_id,
      hostname: hostname,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: sles_version
    },
    fn multi ->
      changeset =
        %HostTelemetryReadModel{}
        |> HostTelemetryReadModel.changeset(%{
          agent_id: agent_id,
          hostname: hostname,
          cpu_count: cpu_count,
          socket_count: socket_count,
          total_memory_mb: total_memory_mb,
          sles_version: sles_version
        })

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
      os_version: sles_version
    },
    fn multi ->
      changeset =
        %HostTelemetryReadModel{}
        |> HostTelemetryReadModel.changeset(%{
          agent_id: agent_id,
          hostname: hostname,
          cpu_count: cpu_count,
          socket_count: socket_count,
          total_memory_mb: total_memory_mb,
          sles_version: sles_version
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
        %HostTelemetryReadModel{}
        |> HostTelemetryReadModel.changeset(%{
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

defmodule Trento.Repo.Migrations.CreateHostTelemetryReadModel do
  use Ecto.Migration

  def change do
    create table(:hosts_telemetry, primary_key: false) do
      add :agent_id, :uuid, primary_key: true
      add :hostname, :string
      add :cpu_count, :integer
      add :socket_count, :integer
      add :total_memory_mb, :integer
      add :sles_version, :string
      add :provider, :string

      timestamps()
    end
  end
end

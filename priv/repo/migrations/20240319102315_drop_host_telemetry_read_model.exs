defmodule Trento.Repo.Migrations.RemoveHostTelemetryReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_telemetry)
  end
end


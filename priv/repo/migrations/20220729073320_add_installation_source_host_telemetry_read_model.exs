defmodule Trento.Repo.Migrations.AddInstallationSourceHostTelemetryReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts_telemetry) do
      add :installation_source, :string
    end
  end
end

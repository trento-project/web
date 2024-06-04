defmodule Trento.Repo.Migrations.CreateAuditLogs do
  use Ecto.Migration

  def change do
    create table(:audit_logs) do
      add :type, :string
      add :actor, :string
      add :outcome, :string
      add :metadata, :map

      timestamps(type: :utc_datetime_usec)
    end

    create index(:audit_logs, [:type])
    create index(:audit_logs, [:actor])
  end
end

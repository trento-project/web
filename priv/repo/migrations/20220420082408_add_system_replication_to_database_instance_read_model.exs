defmodule Trento.Repo.Migrations.AddSystemReplicationToDatabaseInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:database_instances) do
      add :system_replication, :string
      add :system_replication_status, :string
    end
  end
end

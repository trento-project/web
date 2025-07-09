defmodule Trento.Repo.Migrations.AddSystemReplicationValuesToDatabaseInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:database_instances) do
      add :system_replication_site, :string
      add :system_replication_mode, :string
      add :system_replication_operation_mode, :string
      add :system_replication_source_site, :string
      add :system_replication_tier, :integer
    end
  end
end

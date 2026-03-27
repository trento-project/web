defmodule Trento.Repo.Migrations.AddSystemReplicationSiteIdToDatabaseInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:database_instances) do
      add :system_replication_site_id, :integer
    end
  end
end

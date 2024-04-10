defmodule Trento.Repo.Migrations.AddMultipleTenantsToDatabases do
  use Ecto.Migration

  def change do
    alter table(:databases) do
      add :tenants, :map
    end

    alter table(:database_instances) do
      remove :tenant
    end
  end
end

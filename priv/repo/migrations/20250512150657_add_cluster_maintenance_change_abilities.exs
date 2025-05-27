defmodule Trento.Repo.Migrations.AddClusterMaintenanceChangeAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('maintenance_change', 'cluster', 'Permits maintenance change operation on cluster', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'maintenance_change' AND resource = 'cluster'"
  end
end

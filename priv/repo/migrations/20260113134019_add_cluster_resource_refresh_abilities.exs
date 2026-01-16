defmodule Trento.Repo.Migrations.AddClusterResourceRefreshAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('resource_refresh', 'cluster', 'Permits resource refresh operation on cluster', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'resource_refresh' AND resource = 'cluster'"
  end
end

defmodule Trento.Repo.Migrations.AddClusterHostStartStopAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('cluster_host_start', 'cluster', 'Permits host start operation on clusters', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('cluster_host_stop', 'cluster', 'Permits host stop operation on clusters', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'cluster_host_start' AND resource = 'cluster'"
    execute "DELETE FROM abilities WHERE name = 'cluster_host_stop' AND resource = 'cluster'"
  end
end

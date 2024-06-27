defmodule Trento.Repo.Migrations.AddCheckSelectionAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('all', 'host_checks_selection', 'Permits all operation on host checks selection', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('all', 'cluster_checks_selection', 'Permits all operations on cluster checks selection', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'all' AND resource = 'host_checks_selection'"
    execute "DELETE FROM abilities WHERE name = 'all' AND resource = 'cluster_checks_selection'"
  end
end

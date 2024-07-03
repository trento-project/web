defmodule Trento.Repo.Migrations.AddClenaupAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'cleanup', 'host', 'Permits cleanup of hosts', NOW(), NOW())"

    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'cleanup', 'application_instance', 'Permits cleanup of application instances', NOW(), NOW())"

    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'cleanup', 'database_instance', 'Permits cleanup of database instances', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'cleanup' and resource = 'host'"

    execute "DELETE FROM abilities WHERE name = 'cleanup' and resource = 'application_instance'"

    execute "DELETE FROM abilities WHERE name = 'cleanup' and resource = 'database_instance'"
  end
end

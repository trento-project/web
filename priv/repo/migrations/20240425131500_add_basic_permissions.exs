defmodule Trento.Repo.Migrations.AddBasicPermissions do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (1, 'all', 'all', 'Permits all operations on all the resources', NOW(), NOW())"

    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (2, 'all', 'users', 'Permits all operations on user resource', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities where id = 1"
    execute "DELETE FROM abilities where id = 2"
  end
end

defmodule Trento.Repo.Migrations.AddOperationAllAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('operation', 'all', 'Permits running operations in all resources', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'operation' AND resource = 'all'"
  end
end

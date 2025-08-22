defmodule Trento.Repo.Migrations.AddDatabaseStartStopAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('start', 'database', 'Permits start operation on databases', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('stop', 'database', 'Permits stop operation on databases', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'start' AND resource = 'database'"
    execute "DELETE FROM abilities WHERE name = 'stop' AND resource = 'database'"
  end
end

defmodule Trento.Repo.Migrations.AddSapInstanceStartStopAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('start', 'application_instance', 'Permits start operation on application instances', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('stop', 'application_instance', 'Permits stop operation on application instances', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'start' AND resource = 'application_instance'"
    execute "DELETE FROM abilities WHERE name = 'stop' AND resource = 'application_instance'"
  end
end

defmodule Trento.Repo.Migrations.AddActivityLogAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'activity_log', 'users', 'Permits access to users in activity log', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'activity_log' and resource = 'users'"
  end
end

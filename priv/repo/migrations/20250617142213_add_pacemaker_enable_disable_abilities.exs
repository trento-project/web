defmodule Trento.Repo.Migrations.AddPacemakerEnableDisableAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('pacemaker_enable', 'cluster', 'Permits enabling pacemaker on a cluster host', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('pacemaker_disable', 'cluster', 'Permits disabling pacemaker on a cluster host', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'pacemaker_enable' AND resource = 'cluster'"
    execute "DELETE FROM abilities WHERE name = 'pacemaker_disable' AND resource = 'cluster'"
  end
end

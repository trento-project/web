defmodule Trento.Repo.Migrations.AddHostRebootAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('host_reboot', 'host', 'Permits reboot operation on host', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'host_reboot' AND resource = 'host'"
  end
end

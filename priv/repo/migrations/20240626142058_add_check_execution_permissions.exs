defmodule Trento.Repo.Migrations.AddCheckExecutionPermissions do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'all', 'cluster_checks_execution', 'Permits all operations on the Cluster checks executions', NOW(), NOW())"

    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'all', 'hosts_checks_execution', 'Permits all operations on the Host checks executions', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE abilities.name = 'all' and abilities.resource = 'cluster_checks_execution'"

    execute "DELETE FROM abilities WHERE abilities.name = 'all' and abilities.resource = 'hosts_checks_execution'"
  end
end

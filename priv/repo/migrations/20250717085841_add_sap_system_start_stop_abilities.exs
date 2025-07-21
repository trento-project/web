defmodule Trento.Repo.Migrations.AddSapSystemStartStopAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('start', 'sap_system', 'Permits start operation on SAP systems', NOW(), NOW())"

    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('stop', 'sap_system', 'Permits stop operation on SAP systems', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'start' AND resource = 'sap_system'"
    execute "DELETE FROM abilities WHERE name = 'stop' AND resource = 'sap_system'"
  end
end

defmodule Trento.Repo.Migrations.AddSaptuneSolutionChangeAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('saptune_solution_change', 'host', 'Permits Saptune solution change operation on host', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'saptune_solution_change' AND resource = 'host'"
  end
end

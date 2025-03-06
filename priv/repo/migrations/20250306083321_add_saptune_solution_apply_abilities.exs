defmodule Trento.Repo.Migrations.AddSaptuneSolutionApplyAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('saptune_solution_apply', 'host', 'Permits Saptune solution apply operation on host', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'saptune_solution_apply' AND resource = 'host'"
  end
end

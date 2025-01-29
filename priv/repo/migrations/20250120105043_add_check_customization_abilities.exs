defmodule Trento.Repo.Migrations.AddChecksCustomizationAbilities do
  use Ecto.Migration

  def up do
    execute "INSERT INTO abilities(id, name, resource, label, inserted_at, updated_at) VALUES (DEFAULT, 'all', 'check_customization', 'Permits customizing checks values', NOW(), NOW())"
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'all' and resource = 'check_customization'"
  end
end

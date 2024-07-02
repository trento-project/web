defmodule Trento.Repo.Migrations.AddSettingsPermissions do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO abilities (id, name, resource, label, inserted_at, updated_at)
    VALUES (DEFAULT, 'all', 'api_key_settings', 'Permits generation of API keys', NOW(), NOW())
    """

    execute """
    INSERT INTO abilities (id, name, resource, label, inserted_at, updated_at)
    VALUES (DEFAULT, 'all', 'suma_settings', 'Permits all operations on SUMA settings', NOW(), NOW())
    """
  end

  def down do
    execute """
    DELETE FROM abilities 
    WHERE name = 'all' AND resource = 'api_key_settings'
    """

    execute """
    DELETE FROM abilities 
    WHERE name = 'all' AND resource = 'suma_settings'
    """
  end
end

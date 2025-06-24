defmodule Trento.Repo.Migrations.AddAlertingSettingsAbilities do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO abilities(name, resource, label, inserted_at, updated_at)
    VALUES ('all', 'alerting_settings', 'Permits all operations on Alerting Settings', NOW(), NOW())
    """
  end

  def down do
    execute """
    DELETE FROM abilities
    WHERE name = 'all' AND resource = 'alerting_settings'
    """
  end
end

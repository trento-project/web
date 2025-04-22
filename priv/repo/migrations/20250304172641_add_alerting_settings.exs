defmodule Trento.Repo.Migrations.AddAlertingSettings do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO abilities(name, resource, label, inserted_at, updated_at)
    VALUES ('all', 'alerting_settings', 'Permits all operations on Alerting Settings', NOW(), NOW())
    """

    alter table(:settings) do
      add :alerting_enabled, :boolean
      add :alerting_sender_email, :string
      add :alerting_recipient_email, :string
      add :alerting_smtp_server, :string
      add :alerting_smtp_port, :integer
      add :alerting_smtp_username, :string
      add :alerting_smtp_password, :binary
    end
  end

  def down do
    alter table(:settings) do
      remove :alerting_enabled
      remove :alerting_sender_email
      remove :alerting_recipient_email
      remove :alerting_smtp_server
      remove :alerting_smtp_port
      remove :alerting_smtp_username
      remove :alerting_smtp_password
    end

    execute """
    DELETE FROM abilities
    WHERE name = 'all' AND resource = 'alerting_settings'
    """
  end
end

defmodule Trento.Repo.Migrations.AddAlertingSettings do
  use Ecto.Migration

  def change do
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
end

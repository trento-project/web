defmodule Trento.Repo.Migrations.MigrateSumaSettingsSti do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :suse_manager_settings_url, :string
      add :suse_manager_settings_username, :string
      add :suse_manager_settings_password, :binary
      add :suse_manager_settings_ca_cert, :binary
      add :suse_manager_settings_ca_uploaded_at, :utc_datetime_usec
    end

    drop table(:software_update_settings)
  end
end

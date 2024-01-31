defmodule Trento.Repo.Migrations.CreateSoftwareUpdateSettings do
  use Ecto.Migration

  def change do
    settings_name = "software_update_settings"

    create table(:software_update_settings, primary_key: false) do
      add :name, :string, primary_key: true, default: settings_name
      add :url, :string, default: nil
      add :username, :string, default: nil
      add :password, :binary, default: nil
      add :ca_cert, :binary, default: nil
      add :ca_updloaded_at, :utc_datetime_usec, default: nil
    end

    create constraint("software_update_settings", :only_one_record,
             check: "name ='#{settings_name}'"
           )

    execute "INSERT INTO software_update_settings(name) VALUES('#{settings_name}');"
  end

  def down do
    drop table(:software_update_settings)
  end
end

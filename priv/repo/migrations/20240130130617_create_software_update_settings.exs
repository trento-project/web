defmodule Trento.Repo.Migrations.CreateSoftwareUpdateSettings do
  use Ecto.Migration

  def change do
    create table(:software_update_settings, primary_key: false) do
      settings_identifier = UUID.uuid4()

      add :id, :uuid, primary_key: true, default: settings_identifier
      add :url, :string, default: nil
      add :username, :string, default: nil
      add :password, :binary, default: nil
      add :ca_cert, :binary, default: nil
      add :ca_uploaded_at, :utc_datetime_usec, default: nil

      timestamps()
    end

    create constraint("software_update_settings", :only_one_record,
             check: "id ='#{settings_identifier}'"
           )

    execute "INSERT INTO software_update_settings(id, inserted_at, updated_at) VALUES('#{settings_identifier}', NOW(), NOW());"
  end

  def down do
    drop table(:software_update_settings)
  end
end

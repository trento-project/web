defmodule Trento.Repo.Migrations.AddApiKeySettingsToSettingsSchema do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE settings DROP CONSTRAINT settings_pkey"

    alter table(:settings) do
      add :id, :uuid
      # We don't use postgresql enum for the sake of simplicity in updating type values
      add :type, :string
      add :jti, :string
      add :api_key_created_at, :utc_datetime_usec
      add :api_key_expire_at, :utc_datetime_usec
    end

    drop constraint(:settings, :only_one_record)

    create unique_index(:settings, [:type])

    # Assign a new primary key to the already existing settings record, will be an installation_settings type of record

    %Postgrex.Result{rows: rows} =
      repo().query!("SELECT installation_id FROM settings;", [], log: false)

    current_installation_id =
      case rows do
        [] -> UUID.uuid4()
        [[binary_uuid | _] | _] -> UUID.binary_to_string!(binary_uuid)
      end

    execute "UPDATE settings SET id = '#{UUID.uuid4()}',type = 'installation_settings' WHERE installation_id = '#{current_installation_id}'"

    alter table(:settings) do
      modify :type, :string, null: false
      modify :installation_id, :binary_id, null: true
    end

    # Create the new pkey constraint
    execute "ALTER TABLE settings ADD PRIMARY KEY (id)"
  end

  def down do
    execute "ALTER TABLE settings DROP CONSTRAINT settings_pkey"

    alter table(:settings) do
      remove :type
      remove :jti
      remove :id
      remove :api_key_expire_at
      remove :api_key_created_at
      modify :installation_id, :binary_id, null: false
    end

    execute "ALTER TABLE settings ADD PRIMARY KEY (installation_id)"

    %Postgrex.Result{rows: rows} =
      repo().query!("SELECT installation_id FROM settings;", [], log: false)

    current_installation_id =
      case rows do
        [] -> UUID.uuid4()
        [[binary_uuid | _] | _] -> UUID.binary_to_string!(binary_uuid)
      end

    create constraint("settings", :only_one_record,
             check: "installation_id ='#{current_installation_id}'"
           )
  end
end

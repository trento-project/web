defmodule Trento.Repo.Migrations.AddUniquenessToSoftwareUpdatesSettings do
  use Ecto.Migration

  def change do
    %Postgrex.Result{rows: rows} =
      repo().query!("SELECT id FROM software_update_settings;", [], log: false)

    settings_identifier =
      case rows do
        [] -> UUID.uuid4()
        [[binary_uuid | _] | _] -> UUID.binary_to_string!(binary_uuid)
      end

    alter table(:software_update_settings) do
      modify :id, :uuid, default: settings_identifier
    end

    create constraint("software_update_settings", :only_one_record,
             check: "id ='#{settings_identifier}'"
           )

    execute "INSERT INTO software_update_settings(id, inserted_at, updated_at) VALUES('#{settings_identifier}', NOW(), NOW()) ON CONFLICT DO NOTHING;"
  end

  def down do
    drop constraint("software_update_settings", :only_one_record)
  end
end

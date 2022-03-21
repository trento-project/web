defmodule Trento.Repo.Migrations.CreateSettings do
  use Ecto.Migration

  def change do
    create table(:settings, primary_key: false) do
      add :installation_id, :uuid, primary_key: true
      add :eula_accepted, :boolean, default: false
    end

    installation_id = UUID.uuid4()

    create constraint("settings", :only_one_record, check: "installation_id ='#{installation_id}'")

    execute "INSERT INTO settings(installation_id) VALUES('#{installation_id}');"
  end
end

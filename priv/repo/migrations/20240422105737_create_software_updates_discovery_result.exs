defmodule Trento.Repo.Migrations.CreateSoftwareUpdatesDiscoveryResult do
  use Ecto.Migration

  def change do
    create table(:software_updates_discovery_result, primary_key: false) do
      add :host_id, :uuid, primary_key: true
      add :system_id, :string
      add :relevant_patches, :map
      add :upgradable_packages, :map
      add :failure_reason, :string

      timestamps(type: :utc_datetime_usec)
    end
  end
end

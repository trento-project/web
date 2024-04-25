defmodule Trento.Repo.Migrations.RemoveColumnInstallationSettingsEulaAccepted do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      remove :installation_settings_eula_accepted
    end
  end
end

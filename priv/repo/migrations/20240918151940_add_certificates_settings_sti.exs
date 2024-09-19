defmodule Trento.Repo.Migrations.AddCertificatesSettingsSti do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :certificates_settings_name, :string
      add :certificates_settings_key_file, :binary
      add :certificates_settings_certificate_file, :binary
    end

    create unique_index(:settings, [:certificates_settings_name])
  end
end

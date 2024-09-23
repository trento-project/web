defmodule Trento.Repo.Migrations.AddSSOCertificatesSettingsSti do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :sso_certificates_settings_name, :string
      add :sso_certificates_settings_key_file, :binary
      add :sso_certificates_settings_certificate_file, :binary
    end

    create unique_index(:settings, [:sso_certificates_settings_name])
  end
end

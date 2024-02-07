defmodule Trento.Repo.Migrations.CreateSoftwareUpdateSettings do
  use Ecto.Migration

  def change do
    create table(:software_update_settings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :url, :string, default: nil
      add :username, :string, default: nil
      add :password, :binary, default: nil
      add :ca_cert, :binary, default: nil
      add :ca_uploaded_at, :utc_datetime_usec, default: nil

      timestamps()
    end
  end
end

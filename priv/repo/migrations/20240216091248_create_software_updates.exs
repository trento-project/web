defmodule Trento.Repo.Migrations.CreateSoftwareUpdates do
  use Ecto.Migration

  def change do
    create table(:software_updates) do
      timestamps()
    end
  end
end

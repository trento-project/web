defmodule Trento.Repo.Migrations.AddTypeToSapSystems do
  use Ecto.Migration

  def change do
    alter table(:sap_systems) do
      add :type, :string
    end
  end
end

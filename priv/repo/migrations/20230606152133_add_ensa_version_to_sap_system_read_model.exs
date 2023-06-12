defmodule Trento.Repo.Migrations.AddEnsaVersionToSapSystemReadModel do
  use Ecto.Migration

  def change do
    alter table(:sap_systems) do
      add :ensa_version, :string, default: "no_ensa"
    end
  end
end

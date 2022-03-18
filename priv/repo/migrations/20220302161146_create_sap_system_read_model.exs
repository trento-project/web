defmodule Trento.Repo.Migrations.CreateSapSystemReadModel do
  use Ecto.Migration

  def change do
    create table(:sap_systems, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :sid, :string
      add :tenant, :string
      add :db_host, :string
      add :health, :string
    end
  end
end

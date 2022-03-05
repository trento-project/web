defmodule Tronto.Repo.Migrations.AddSapSystemReadModel do
  use Ecto.Migration

  def change do
    create table(:sap_systems, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :sid, :string
      add :tenant, :string
      add :db_host, :string
    end
  end
end

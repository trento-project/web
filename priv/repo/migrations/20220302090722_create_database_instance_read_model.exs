defmodule Trento.Repo.Migrations.CreateDatabaseInstanceReadModel do
  use Ecto.Migration

  def change do
    create table(:database_instances, primary_key: false) do
      add :sap_system_id, :uuid, primary_key: true
      add :host_id, :uuid, primary_key: true
      add :instance_number, :string, primary_key: true
      add :sid, :string
      add :tenant, :string
      add :features, :string
      add :health, :string
    end

    create index(:database_instances, [:host_id])
  end
end

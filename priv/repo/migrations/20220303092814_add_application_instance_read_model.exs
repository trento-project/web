defmodule Tronto.Repo.Migrations.AddApplicationInstanceReadModel do
  use Ecto.Migration

  def change do
    create table(:application_instances, primary_key: false) do
      add :sap_system_id, :uuid, primary_key: true
      add :host_id, :uuid, primary_key: true
      add :instance_number, :string, primary_key: true
      add :sid, :string
      add :features, :string
    end

    create index(:application_instances, [:host_id])
  end
end

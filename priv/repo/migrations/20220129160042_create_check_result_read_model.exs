defmodule Tronto.Repo.Migrations.CreateCheckResultReadModel do
  use Ecto.Migration

  def change do
    create table(:checks_results, primary_key: false) do
      add :host_id, :uuid, primary_key: true
      add :cluster_id, :uuid, primary_key: true
      add :check_id, :string, primary_key: true
      add :result, :string

      timestamps()
    end
  end
end

defmodule Tronto.Repo.Migrations.AddClusterIdField do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :cluster_id, :uuid
    end

    create index(:clusters, [:id])
  end
end

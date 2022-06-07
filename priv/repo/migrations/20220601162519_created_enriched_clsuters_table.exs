defmodule Trento.Repo.Migrations.CreateEnrichedClustersTable do
  use Ecto.Migration

  def change do
    create table(:enriched_clusters, primary_key: false) do
      add :cluster_id, :uuid, primary_key: true
      add :cib_last_written, :string
    end
  end
end

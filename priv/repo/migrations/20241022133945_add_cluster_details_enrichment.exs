defmodule Trento.Repo.Migrations.AddClusterDetailsEnrichment do
  use Ecto.Migration

  def change do
    alter table(:clusters_enrichment_data) do
      add :details, :map
    end
  end
end

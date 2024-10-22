defmodule Trento.Repo.Migrations.AddClusterNodeAttributesEnrichment do
  use Ecto.Migration

  def change do
    alter table(:clusters_enrichment_data) do
      add :nodes_attributes, :map
    end
  end
end

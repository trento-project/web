defmodule Tronto.Repo.Migrations.AddTags do
  use Ecto.Migration

  def change do
    create table(:tags, primary_key: true) do
      add :value, :string
      add :resource_id, :uuid
      add :resource_type, :string
    end

    create unique_index(:tags, [:value, :resource_id])
  end
end

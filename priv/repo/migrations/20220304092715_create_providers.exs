defmodule Tronto.Repo.Migrations.CreateProviders do
  use Ecto.Migration

  def change do
    create table(:providers, primary_key: false) do
      add :host_id, :uuid, primary_key: true
      add :provider, :string
      add :data, :map

      timestamps()
    end

    create unique_index(:providers, [:host_id])
  end
end

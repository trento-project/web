defmodule Tronto.Repo.Migrations.AddDetailsToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :details, :map
    end
  end
end

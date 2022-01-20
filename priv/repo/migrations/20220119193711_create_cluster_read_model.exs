defmodule Tronto.Repo.Migrations.CreateClusterReadModel do
  use Ecto.Migration

  def change do
    create table(:clusters, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :sid, :string
      add :type, :string
    end
  end
end

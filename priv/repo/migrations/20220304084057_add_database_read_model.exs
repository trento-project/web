defmodule Tronto.Repo.Migrations.AddDatabaseReadModel do
  use Ecto.Migration

  def change do
    create table(:databases, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :sid, :string
    end
  end
end

defmodule Trento.Repo.Migrations.CreateAbilities do
  use Ecto.Migration

  def change do
    create table(:abilities) do
      add :name, :string
      add :resource, :string
      add :label, :string

      timestamps()
    end

    create unique_index(:abilities, [:name, :resource])
  end
end

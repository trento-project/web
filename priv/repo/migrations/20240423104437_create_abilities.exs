defmodule Trento.Repo.Migrations.CreateAbilities do
  use Ecto.Migration

  def change do
    create table(:abilities) do
      add :name, :string
      add :resource, :string
      add :label, :string

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:abilities, [:name, :resource])
  end
end

defmodule Trento.Repo.Migrations.AttachAbilitiesToUsers do
  use Ecto.Migration

  def change do
    create table(:users_abilities) do
      add :user_id, references(:users, primary_key: true)
      add :ability_id, references(:abilities, primary_key: true)

      timestamps()
    end

    create unique_index(:users_abilities, [:user_id, :ability_id])
  end
end

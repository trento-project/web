defmodule Trento.Repo.Migrations.AttachAbilitiesToUsers do
  use Ecto.Migration

  def change do
    create table(:users_abilities) do
      add :user_id, references(:users)
      add :ability_id, references(:abilities)

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:users_abilities, [:user_id, :ability_id])
  end
end

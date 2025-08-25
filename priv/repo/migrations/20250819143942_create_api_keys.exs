defmodule Trento.Repo.Migrations.CreateApiKeys do
  use Ecto.Migration

  def change do
    create table(:api_keys) do
      add :name, :string
      add :expire_at, :utc_datetime_usec
      add :user_id, references(:users, on_delete: :delete_all), null: false

      timestamps(inserted_at: :created_at, type: :utc_datetime_usec)
    end

    create unique_index(:api_keys, [:user_id, :name])
  end
end

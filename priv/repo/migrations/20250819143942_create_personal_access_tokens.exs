defmodule Trento.Repo.Migrations.CreatePersonalAccessTokens do
  use Ecto.Migration

  def change do
    create table(:personal_access_tokens, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :hashed_token, :string, primary_key: true
      add :name, :string, null: false
      add :expires_at, :utc_datetime_usec
      add :user_id, references(:users, on_delete: :delete_all), null: false

      timestamps(inserted_at: :created_at, type: :utc_datetime_usec)
    end

    create unique_index(:personal_access_tokens, [:user_id, :name])
    create unique_index(:personal_access_tokens, [:user_id, :hashed_token])
  end
end

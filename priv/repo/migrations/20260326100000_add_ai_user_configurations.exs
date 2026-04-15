defmodule Trento.Repo.Migrations.AddAiUserConfigurationsTable do
  use Ecto.Migration

  def change do
    create table(:ai_configurations, primary_key: false) do
      add :user_id, references(:users, on_delete: :delete_all), primary_key: true
      add :provider, :string
      add :model, :string
      add :api_key, :binary

      timestamps(type: :utc_datetime_usec)
    end
  end
end

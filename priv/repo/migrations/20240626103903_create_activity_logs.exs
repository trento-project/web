defmodule Trento.Repo.Migrations.CreateActivityLogs do
  use Ecto.Migration

  def change do
    create table(:activity_logs, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :type, :string
      add :actor, :string
      add :metadata, :map

      timestamps(type: :utc_datetime_usec)
    end
  end
end

defmodule Trento.Repo.Migrations.CreateHeartbeats do
  use Ecto.Migration

  def change do
    create table(:heartbeats, primary_key: false) do
      add :agent_id, :string, primary_key: true
      add :timestamp, :utc_datetime_usec
    end
  end
end

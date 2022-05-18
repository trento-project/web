defmodule Trento.Repo.Migrations.AddDiscardedEventsTable do
  use Ecto.Migration

  def change do
    create table(:discarded_events) do
      add :payload, :map
      add :reason, :text

      timestamps()
    end
  end
end

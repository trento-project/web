defmodule Trento.Repo.Migrations.AddDeregisteredAtToDatabaseReadModel do
  use Ecto.Migration

  def change do
    alter table(:databases) do
      add :deregistered_at, :utc_datetime_usec
    end
  end
end

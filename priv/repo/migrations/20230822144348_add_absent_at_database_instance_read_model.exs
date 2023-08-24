defmodule Trento.Repo.Migrations.AddAbsentDatabaseInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:database_instances) do
      add :absent_at, :utc_datetime_usec
    end
  end
end

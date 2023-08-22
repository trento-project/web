defmodule Trento.Repo.Migrations.AddAbsentApplicationInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:application_instances) do
      add :absent, :utc_datetime_usec
    end
  end
end

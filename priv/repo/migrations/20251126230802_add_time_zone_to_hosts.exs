defmodule Trento.Repo.Migrations.AddTimeZoneToHosts do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :time_zone, :string
    end
  end
end

defmodule Trento.Repo.Migrations.AddSystemdUnitsToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :systemd_units, :map
    end
  end
end

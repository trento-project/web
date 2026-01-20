defmodule Trento.Repo.Migrations.AddPrometheusModeToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :prometheus_mode, :string
    end

    execute "UPDATE hosts SET prometheus_mode = 'pull'"
  end
end

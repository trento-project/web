defmodule Trento.Repo.Migrations.AddPrometheusTargetsToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :prometheus_targets, :map
    end
  end
end

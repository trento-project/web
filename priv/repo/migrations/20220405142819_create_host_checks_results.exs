defmodule Trento.Repo.Migrations.CreateHostChecksResults do
  use Ecto.Migration

  def change do
    create table(:hosts_checks_results, primary_key: false) do
      add :cluster_id, :uuid, primary_key: true
      add :host_id, :uuid, primary_key: true
      add :reachable, :boolean
      add :msg, :string
    end
  end
end

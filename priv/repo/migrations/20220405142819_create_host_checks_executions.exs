defmodule Trento.Repo.Migrations.CreateHostChecksExecutions do
  use Ecto.Migration

  def change do
    create table(:hosts_checks_executions, primary_key: false) do
      add :cluster_id, :uuid, primary_key: true
      add :host_id, :uuid, primary_key: true
      add :reachable, :boolean
      add :msg, :string
    end
  end
end

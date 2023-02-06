defmodule Trento.Repo.Migrations.RemoveHostChecksExecutionsReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_checks_executions)
  end
end

defmodule Trento.Repo.Migrations.CreateActivityLogSeverityFieldIndex do
  use Ecto.Migration

  def change do
    create index(:activity_logs, [:severity])
  end
end

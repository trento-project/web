defmodule Trento.Repo.Migrations.AddActivityLogSeverityField do
  use Ecto.Migration

  def change do
    alter(table(:activity_logs)) do
      add :severity, :integer
    end

    create index(:activity_logs, [:severity])
  end
end

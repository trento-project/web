defmodule Trento.Repo.Migrations.AddActivityLogSettings do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :activity_log_retention_time, :map
    end
  end

  def down do
    execute "DELETE from settings WHERE type = 'activity_log_settings'"

    alter table(:settings) do
      remove :activity_log_retention_time
    end
  end
end

defmodule Trento.Repo.Migrations.AddActivityLogSettings do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :activity_log_retention_time, :map
    end
  end
end

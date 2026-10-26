defmodule Trento.Repo.Migrations.AddChecksScheduleToTargets do
  use Ecto.Migration

  def change do
    create table(:checks_target_settings, primary_key: false) do
      add :target_id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :interval, :string
      add :exception_window, :map

      timestamps(type: :utc_datetime_usec)
    end

    create table(:checks_execution_requests, primary_key: false) do
      add :target_id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :last_requested_at, :utc_datetime_usec, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end
end

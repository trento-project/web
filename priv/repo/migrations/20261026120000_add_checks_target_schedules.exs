defmodule Trento.Repo.Migrations.AddChecksTargetSchedules do
  use Ecto.Migration

  def change do
    create table(:checks_target_schedules, primary_key: false) do
      add :target_id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :interval, :string
      add :window_starts_at, :utc_datetime_usec
      add :window_timezone, :string
      add :window_duration_minutes, :integer
      add :window_frequency, :string
      add :window_interval, :integer
      add :window_weekdays, {:array, :integer}
      add :last_requested_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end
  end
end

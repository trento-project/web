defmodule Trento.Repo.Migrations.AddOperationSchedules do
  use Ecto.Migration

  def change do
    create table(:operation_schedules, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :target_id, :uuid, null: false
      add :operation, :string, null: false
      add :params, :map, null: false, default: %{}
      add :starts_at, :utc_datetime_usec, null: false
      add :timezone, :string, null: false
      add :frequency, :string
      add :interval, :integer, null: false, default: 1
      add :weekdays, {:array, :integer}, null: false, default: []
      add :ends_on, :date
      add :max_occurrences, :integer
      add :next_run_at, :utc_datetime_usec, null: false
      add :occurrences, :integer, null: false, default: 0
      add :bulk_id, :uuid
      add :created_by, :string

      timestamps(type: :utc_datetime_usec)
    end

    create index(:operation_schedules, [:target_id])
    create index(:operation_schedules, [:next_run_at])
  end
end

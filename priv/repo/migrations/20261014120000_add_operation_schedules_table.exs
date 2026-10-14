# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddOperationSchedulesTable do
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
      add :occurrences, :integer, null: false, default: 0
      add :next_run_at, :utc_datetime_usec
      add :created_by_id, references(:users, on_delete: :nilify_all)

      timestamps(type: :utc_datetime_usec)
    end

    # One schedule per operation and target
    create unique_index(:operation_schedules, [:target_id, :operation])
  end
end

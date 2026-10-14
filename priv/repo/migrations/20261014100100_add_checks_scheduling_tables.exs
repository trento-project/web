# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksSchedulingTables do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :checks_execution_interval, :integer
    end

    create table(:checks_schedules, primary_key: false) do
      add :target_id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :interval, :integer
      add :last_scheduled_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end

    create table(:checks_exception_windows, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :target_id, :uuid, null: false
      add :target_type, :string, null: false
      add :starts_at, :utc_datetime_usec, null: false
      add :duration, :integer, null: false

      timestamps(type: :utc_datetime_usec)
    end

    create index(:checks_exception_windows, [:target_id])
  end
end

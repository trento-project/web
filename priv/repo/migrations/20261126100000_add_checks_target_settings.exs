# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksTargetSettings do
  use Ecto.Migration

  def change do
    create table(:checks_target_settings, primary_key: false) do
      add :target_id, :uuid, primary_key: true
      add :target_type, :string, null: false
      add :enabled, :boolean, null: false
      add :frequency, :map, null: false

      timestamps(type: :utc_datetime_usec)
    end
  end
end

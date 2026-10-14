# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddRecurrenceToChecksExceptionWindows do
  use Ecto.Migration

  def change do
    alter table(:checks_exception_windows) do
      add :timezone, :string, null: false, default: "Etc/UTC"
      add :frequency, :string
      add :interval, :integer, null: false, default: 1
      add :weekdays, {:array, :integer}, null: false, default: []
      add :ends_on, :date
    end
  end
end

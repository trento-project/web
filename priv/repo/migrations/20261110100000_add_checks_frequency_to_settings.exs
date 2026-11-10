# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksFrequencyToSettings do
  use Ecto.Migration

  def up do
    alter table(:settings) do
      add :checks_frequency, :map
    end
  end

  def down do
    execute "DELETE FROM settings WHERE type = 'checks_frequency_settings'"

    alter table(:settings) do
      remove :checks_frequency
    end
  end
end

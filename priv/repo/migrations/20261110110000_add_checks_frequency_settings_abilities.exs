# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksFrequencySettingsAbilities do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO abilities(name, resource, label, inserted_at, updated_at)
    VALUES ('all', 'checks_frequency_settings', 'Permits all operations on Checks Frequency Settings', NOW(), NOW())
    """
  end

  def down do
    execute """
    DELETE FROM abilities
    WHERE name = 'all' AND resource = 'checks_frequency_settings'
    """
  end
end

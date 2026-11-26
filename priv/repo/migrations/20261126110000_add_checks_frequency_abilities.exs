# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksFrequencyAbilities do
  use Ecto.Migration

  def up do
    execute """
    INSERT INTO abilities(name, resource, label, inserted_at, updated_at)
    VALUES
      ('all', 'host_checks_frequency', 'Permits changing the checks frequency of hosts', NOW(), NOW()),
      ('all', 'cluster_checks_frequency', 'Permits changing the checks frequency of clusters', NOW(), NOW())
    """
  end

  def down do
    execute """
    DELETE FROM users_abilities
    WHERE ability_id IN (
      SELECT id FROM abilities
      WHERE name = 'all' AND resource IN ('host_checks_frequency', 'cluster_checks_frequency')
    )
    """

    execute """
    DELETE FROM abilities
    WHERE name = 'all' AND resource IN ('host_checks_frequency', 'cluster_checks_frequency')
    """
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSumaAbilityLabel do
  use Ecto.Migration

  def up do
    execute """
    UPDATE abilities
    SET label = 'Permits all operations on SUSE Multi-Linux Manager settings'
    WHERE name = 'all' AND resource = 'suma_settings'
    """
  end

  def down do
    execute """
    UPDATE abilities
    SET label = 'Permits all operations on SUMA settings'
    WHERE name = 'all' AND resource = 'suma_settings'
    """
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSumaSettingsIdentifiers do
  use Ecto.Migration

  def up do
    execute """
    UPDATE abilities
    SET resource = 'smlm_settings'
    WHERE name = 'all' AND resource = 'suma_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'saving_smlm_settings'
    WHERE type = 'saving_suma_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'changing_smlm_settings'
    WHERE type = 'changing_suma_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'clearing_smlm_settings'
    WHERE type = 'clearing_suma_settings'
    """
  end

  def down do
    execute """
    UPDATE abilities
    SET resource = 'suma_settings'
    WHERE name = 'all' AND resource = 'smlm_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'saving_suma_settings'
    WHERE type = 'saving_smlm_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'changing_suma_settings'
    WHERE type = 'changing_smlm_settings'
    """

    execute """
    UPDATE activity_logs
    SET type = 'clearing_suma_settings'
    WHERE type = 'clearing_smlm_settings'
    """
  end
end

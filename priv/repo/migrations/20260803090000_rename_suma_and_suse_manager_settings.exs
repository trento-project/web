# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSumaAndSuseManagerSettings do
  use Ecto.Migration

  def up do
    execute """
    UPDATE abilities
    SET resource = 'smlm_settings',
        label = 'Permits all operations on SUSE Multi-Linux Manager settings'
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

    execute """
    UPDATE settings
    SET type = 'suse_multi_linux_manager_settings'
    WHERE type = 'suse_manager_settings'
    """

    rename table(:settings), :suse_manager_settings_url, to: :suse_multi_linux_manager_settings_url

    rename table(:settings), :suse_manager_settings_username,
      to: :suse_multi_linux_manager_settings_username

    rename table(:settings), :suse_manager_settings_password,
      to: :suse_multi_linux_manager_settings_password

    rename table(:settings), :suse_manager_settings_ca_cert,
      to: :suse_multi_linux_manager_settings_ca_cert

    rename table(:settings), :suse_manager_settings_ca_uploaded_at,
      to: :suse_multi_linux_manager_settings_ca_uploaded_at
  end

  def down do
    rename table(:settings), :suse_multi_linux_manager_settings_url, to: :suse_manager_settings_url

    rename table(:settings), :suse_multi_linux_manager_settings_username,
      to: :suse_manager_settings_username

    rename table(:settings), :suse_multi_linux_manager_settings_password,
      to: :suse_manager_settings_password

    rename table(:settings), :suse_multi_linux_manager_settings_ca_cert,
      to: :suse_manager_settings_ca_cert

    rename table(:settings), :suse_multi_linux_manager_settings_ca_uploaded_at,
      to: :suse_manager_settings_ca_uploaded_at

    execute """
    UPDATE settings
    SET type = 'suse_manager_settings'
    WHERE type = 'suse_multi_linux_manager_settings'
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

    execute """
    UPDATE abilities
    SET resource = 'suma_settings',
        label = 'Permits all operations on SUMA settings'
    WHERE name = 'all' AND resource = 'smlm_settings'
    """
  end
end

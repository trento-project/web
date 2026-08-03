# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSuseManagerSettingsStiType do
  use Ecto.Migration

  def up do
    execute """
    UPDATE settings
    SET type = 'suse_multi_linux_manager_settings'
    WHERE type = 'suse_manager_settings'
    """
  end

  def down do
    execute """
    UPDATE settings
    SET type = 'suse_manager_settings'
    WHERE type = 'suse_multi_linux_manager_settings'
    """
  end
end

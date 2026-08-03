# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSuseManagerSettingsColumns do
  use Ecto.Migration

  def up do
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
  end
end

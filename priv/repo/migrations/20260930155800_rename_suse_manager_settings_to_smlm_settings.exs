# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameSuseManagerSettingsToSmlmSettings do
  use Ecto.Migration

  def change do
    rename table(:settings), :suse_manager_settings_url, to: :smlm_settings_url
    rename table(:settings), :suse_manager_settings_username, to: :smlm_settings_username
    rename table(:settings), :suse_manager_settings_password, to: :smlm_settings_password
    rename table(:settings), :suse_manager_settings_ca_cert, to: :smlm_settings_ca_cert

    rename table(:settings), :suse_manager_settings_ca_uploaded_at,
      to: :smlm_settings_ca_uploaded_at

    execute(
      "UPDATE settings SET type = 'smlm_settings' WHERE type = 'suse_manager_settings'",
      "UPDATE settings SET type = 'suse_manager_settings' WHERE type = 'smlm_settings'"
    )
  end
end

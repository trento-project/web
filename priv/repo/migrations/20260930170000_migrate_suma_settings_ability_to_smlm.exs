# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.MigrateSumaSettingsAbilityToSmlm do
  use Ecto.Migration

  def change do
    execute(
      """
      UPDATE abilities
      SET resource = 'smlm_settings'
      WHERE resource = 'suma_settings';
      """,
      """
      UPDATE abilities
      SET resource = 'suma_settings'
      WHERE resource = 'smlm_settings';
      """
    )
  end
end

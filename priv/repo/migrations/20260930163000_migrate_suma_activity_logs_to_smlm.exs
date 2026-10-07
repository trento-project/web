# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.MigrateSumaActivityLogsToSmlm do
  use Ecto.Migration

  def change do
    execute(
      """
      UPDATE activity_logs
      SET type = CASE type
        WHEN 'saving_suma_settings' THEN 'saving_smlm_settings'
        WHEN 'changing_suma_settings' THEN 'changing_smlm_settings'
        WHEN 'clearing_suma_settings' THEN 'clearing_smlm_settings'
        ELSE type
      END
      WHERE type IN ('saving_suma_settings', 'changing_suma_settings', 'clearing_suma_settings');
      """,
      """
      UPDATE activity_logs
      SET type = CASE type
        WHEN 'saving_smlm_settings' THEN 'saving_suma_settings'
        WHEN 'changing_smlm_settings' THEN 'changing_suma_settings'
        WHEN 'clearing_smlm_settings' THEN 'clearing_suma_settings'
        ELSE type
      END
      WHERE type IN ('saving_smlm_settings', 'changing_smlm_settings', 'clearing_smlm_settings');
      """
    )
  end
end

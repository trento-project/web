# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.ReprojectForHealthDetails do
  use Ecto.Migration

  def up do
    # TODO: Verify names! Verify if truncation is needed on the Instances tables!
    execute "TRUNCATE TABLE clusters;"
    execute "TRUNCATE TABLE hosts;"
    execute "TRUNCATE TABLE sap_systems;"
    execute "TRUNCATE TABLE databases;"

    # Mark cluster_projector for rebuild. This would be finalized in
    # Trento.Release.init() task named `repair_projections`.
    # NOTE: The SQL command is UPDATE so it skips setting last seen
    # event to 0 if no such row exists. We want to rebuild only if
    # there were projections already.
    execute("""
      UPDATE projection_versions
      SET last_seen_event_number = 0, updated_at = NOW()
      WHERE projection_name = 'cluster_projector';
    """)

    # TODO: Executes for the other projectors
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.HealthDetailsInReadModel do
  use Ecto.Migration

  def up do
    alter table("clusters") do
      add :health_details, :map
    end

    execute "TRUNCATE TABLE clusters;"

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
  end

  def down do
    alter table("clusters") do
      remove :health_details
    end
  end
end

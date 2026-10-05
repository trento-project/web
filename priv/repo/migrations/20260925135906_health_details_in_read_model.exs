# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.HealthDetailsInReadModel do
  use Ecto.Migration

  # TODO: Remove these.
  # import Ecto.Query

  # alias Trento.Repo

  def up do
    alter table("clusters") do
      add :health_details, :map
    end

    # Delete the clusters table and delete the row tracking the
    # last_seen_event. This would trigger a projection rebuild. Hint:
    # the finishing step of this process is in the
    # Trento.Release.init() task named `repair_projections`.
    execute "TRUNCATE TABLE clusters;"
    execute "DELETE FROM projection_versions WHERE projection_name = 'cluster_projector';"
  end

  # TODO: remove these
    # # Flush DDL before data migration step.
    # flush()

    # from(c in "clusters",
    #   where: is_nil(c.health_details),
    #   update: [
    #     set: [
    #       health_details:
    #         fragment(
    #           """
    #           CASE
    #               WHEN ? in ('hana_scale_up', 'hana_scale_out')
    #                   THEN jsonb_build_object('checks_health', 'unknown',
    #                                           'sbd_health', 'unknown',
    #                                           'replication_health', 'unknown')
    #               WHEN ? = 'ascs_ers'
    #                   THEN jsonb_build_object('checks_health', 'unknown',
    #                                           'sbd_health', 'unknown',
    #                                           'distributed_health', 'unknown')
    #             ELSE NULL
    #           END
    #           """,
    #           c.type,
    #           c.type
    #         )
    #     ]
    #   ]
    # )
    # |> Repo.update_all([])
  # end

  def down do
    alter table("clusters") do
      remove :health_details
    end
  end
end

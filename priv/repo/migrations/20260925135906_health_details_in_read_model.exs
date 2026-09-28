# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.HealthDetailsInReadModel do
  use Ecto.Migration

  import Ecto.Query

  alias Trento.Repo

  def up do
    alter table("clusters") do
      add :health_details, :map
    end

    # Flush DDL before data migration step.
    flush()

    from(c in "clusters",
      where: is_nil(c.health_details),
      update: [
        set: [
          health_details:
            fragment(
              """
              CASE
                  WHEN ? in ('hana_scale_up', 'hana_scale_out')
                      THEN jsonb_build_object('checks_health', 'unknown',
                                              'sbd_health', 'unknown',
                                              'replication_health', 'unknown')
                  WHEN ? = 'ascs_ers'
                      THEN jsonb_build_object('checks_health', 'unknown',
                                              'sbd_health', 'unknown',
                                              'distributed_health', 'unknown')
                ELSE NULL
              END
              """,
              c.type,
              c.type
            )
        ]
      ]
    )
    |> Repo.update_all([])
  end

  def down do
    alter table("clusters") do
      remove :health_details
    end
  end
end

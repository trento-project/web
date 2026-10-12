# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddClusterIdField do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :cluster_id, :uuid
    end

    create index(:clusters, [:id])
  end
end

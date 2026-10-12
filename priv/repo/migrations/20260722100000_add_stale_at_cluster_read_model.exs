# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddStaleAtClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :stale_at, :utc_datetime_usec
    end
  end
end

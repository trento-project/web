# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddStaleAtDatabaseReadModel do
  use Ecto.Migration

  def change do
    alter table(:databases) do
      add :stale_at, :utc_datetime_usec
    end
  end
end

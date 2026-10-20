# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddLastBootTimeToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :last_boot_timestamp, :utc_datetime
    end
  end
end

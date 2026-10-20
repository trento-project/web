# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddLockedTimestampToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :locked_at, :utc_datetime_usec
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddDeletedAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :deleted_at, :utc_datetime_usec
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddDeregisteredAtToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :deregistered_at, :utc_datetime_usec
    end
  end
end

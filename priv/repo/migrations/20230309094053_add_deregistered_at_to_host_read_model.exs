# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddDeregisteredAtToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :deregistered_at, :utc_datetime_usec
    end
  end
end

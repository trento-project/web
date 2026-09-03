# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddStaleAtSapSystemReadModel do
  use Ecto.Migration

  def change do
    alter table(:sap_systems) do
      add :stale_at, :utc_datetime_usec
    end
  end
end

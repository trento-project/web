# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddDiscardedDiscoveryEventTable do
  use Ecto.Migration

  def change do
    create table(:discarded_discovery_events) do
      add :payload, :map
      add :reason, :text

      timestamps()
    end
  end
end

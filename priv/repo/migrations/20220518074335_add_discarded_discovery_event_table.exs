# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

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

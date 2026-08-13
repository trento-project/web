# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddDiscoveryEventsInsertedAtIndex do
  use Ecto.Migration

  def change do
    create index(:discovery_events, [:inserted_at])
    create index(:discarded_discovery_events, [:inserted_at])
  end
end

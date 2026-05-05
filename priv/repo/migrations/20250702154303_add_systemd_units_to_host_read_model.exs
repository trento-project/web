# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddSystemdUnitsToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :systemd_units, :map
    end
  end
end

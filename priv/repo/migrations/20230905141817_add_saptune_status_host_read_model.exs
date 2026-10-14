# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddSaptuneStatusHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :saptune_status, :map
    end
  end
end

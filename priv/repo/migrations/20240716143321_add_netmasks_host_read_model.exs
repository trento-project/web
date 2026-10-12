# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddNetmasksHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :netmasks, {:array, :integer}
    end
  end
end

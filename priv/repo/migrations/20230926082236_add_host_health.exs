# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHostHealth do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :health, :string
    end
  end
end

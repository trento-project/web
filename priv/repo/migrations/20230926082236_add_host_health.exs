# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddHostHealth do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :health, :string
    end
  end
end

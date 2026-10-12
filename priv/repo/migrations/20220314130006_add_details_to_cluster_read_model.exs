# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddDetailsToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :details, :map
    end
  end
end

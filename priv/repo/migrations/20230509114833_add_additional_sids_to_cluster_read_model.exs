# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddAdditionalSidsToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :additional_sids, {:array, :string}, default: []
    end
  end
end

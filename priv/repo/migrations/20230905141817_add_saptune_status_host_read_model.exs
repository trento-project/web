# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddSaptuneStatusHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :saptune_status, :map
    end
  end
end

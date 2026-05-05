# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddArchToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :arch, :string
    end
  end
end

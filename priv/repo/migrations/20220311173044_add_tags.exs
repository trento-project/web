# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddTags do
  use Ecto.Migration

  def change do
    create table(:tags, primary_key: true) do
      add :value, :string
      add :resource_id, :uuid
      add :resource_type, :string
    end

    create unique_index(:tags, [:value, :resource_id])
  end
end

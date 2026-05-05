# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddDatabaseSapSystemRelationship do
  use Ecto.Migration

  def change do
    alter table(:sap_systems) do
      add :database_id, :binary_id
    end
  end
end

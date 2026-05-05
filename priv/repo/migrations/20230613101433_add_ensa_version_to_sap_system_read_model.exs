# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddEnsaVersionToSapSystemReadModel do
  use Ecto.Migration

  def change do
    alter table(:sap_systems) do
      add :ensa_version, :string
    end
  end
end

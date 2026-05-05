# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddSapInstancesClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :sap_instances, :map
      remove :sid
      remove :additional_sids
    end
  end
end

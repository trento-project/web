# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddStaleApplicationInstanceReadModel do
  use Ecto.Migration

  def change do
    alter table(:application_instances) do
      add :stale, :boolean
    end
  end
end

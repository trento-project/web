# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddSelectedChecksToCluster do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :selected_checks, {:array, :string}
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddStateToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :state, :string
    end
  end
end

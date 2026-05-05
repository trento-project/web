# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddDetailsToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :details, :map
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddChecksExecutionToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :checks_execution, :string
    end
  end
end

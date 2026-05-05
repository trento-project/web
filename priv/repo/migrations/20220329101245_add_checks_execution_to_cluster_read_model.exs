# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddChecksExecutionToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :checks_execution, :string
    end
  end
end

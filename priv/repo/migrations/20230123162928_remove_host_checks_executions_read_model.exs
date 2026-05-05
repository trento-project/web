# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RemoveHostChecksExecutionsReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_checks_executions)
  end
end

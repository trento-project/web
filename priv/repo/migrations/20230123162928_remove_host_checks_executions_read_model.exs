# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RemoveHostChecksExecutionsReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_checks_executions)
  end
end

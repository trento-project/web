# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RemoveHostTelemetryReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_telemetry)
  end
end

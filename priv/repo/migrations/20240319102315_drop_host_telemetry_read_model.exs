# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RemoveHostTelemetryReadModel do
  use Ecto.Migration

  def change do
    drop table(:hosts_telemetry)
  end
end

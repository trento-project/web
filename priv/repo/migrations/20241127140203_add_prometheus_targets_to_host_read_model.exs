# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddPrometheusTargetsToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :prometheus_targets, :map
    end
  end
end

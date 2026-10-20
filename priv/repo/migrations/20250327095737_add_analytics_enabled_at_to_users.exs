# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddAnalyticsEnabledAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :analytics_enabled_at, :utc_datetime_usec
    end
  end
end

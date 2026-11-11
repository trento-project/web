# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.HealthDetailsInReadModel do
  use Ecto.Migration

  def up do
    alter table("clusters") do
      add :health_details, :map
    end
  end

  def down do
    alter table("clusters") do
      remove :health_details
    end
  end
end

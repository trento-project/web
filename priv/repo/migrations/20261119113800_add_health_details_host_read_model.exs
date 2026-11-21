# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHealthDetailsHostReadModel do
  use Ecto.Migration

  def up do
    alter table("hosts") do
      add :health_details, :map
    end
  end

  def down do
    alter table("hosts") do
      remove :health_details
    end
  end
end

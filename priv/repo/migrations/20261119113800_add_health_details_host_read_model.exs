# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHealthDetailsHostReadModel do
  use Ecto.Migration

  def change do
    alter table("hosts") do
      add :health_details, :map
    end
  end
end

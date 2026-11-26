# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHealthDetailsDatabaseReadModel do
  use Ecto.Migration

  def change do
    alter table("databases") do
      add :health_details, :map
    end
  end
end

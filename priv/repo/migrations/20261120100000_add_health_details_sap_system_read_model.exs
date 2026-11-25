# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHealthDetailsSapSystemReadModel do
  use Ecto.Migration

  def change do
    alter table("sap_systems") do
      add :health_details, :map
    end
  end
end

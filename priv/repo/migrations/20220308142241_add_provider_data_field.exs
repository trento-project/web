# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddProviderDataField do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :provider_data, :map
    end
  end
end

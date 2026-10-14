# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RemoveSshAddressHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      remove :ssh_address
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddSshAddressToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :ssh_address, :string
    end
  end
end

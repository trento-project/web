# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddSshAddressToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :ssh_address, :string
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddProviderToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :provider, :string
    end
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.UniqueEmailForUsers do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:email])
  end
end

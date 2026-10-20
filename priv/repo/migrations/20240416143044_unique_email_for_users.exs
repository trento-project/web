# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.UniqueEmailForUsers do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:email])
  end
end

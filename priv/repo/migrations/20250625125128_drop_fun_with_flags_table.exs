# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.DropFunWithFlagsTable do
  use Ecto.Migration

  def change do
    drop table(:fun_with_flags_toggles)
  end
end

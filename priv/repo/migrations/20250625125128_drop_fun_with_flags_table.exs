# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.DropFunWithFlagsTable do
  use Ecto.Migration

  def change do
    drop table(:fun_with_flags_toggles)
  end
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RestartAbilitiesSequence do
  use Ecto.Migration

  def up do
    execute "ALTER SEQUENCE abilities_id_seq RESTART WITH 3"
  end

  def down do
    execute "ALTER SEQUENCE abilities_id_seq RESTART WITH 1"
  end
end

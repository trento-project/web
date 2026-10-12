# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RemoveHostConnectionSettings do
  use Ecto.Migration

  def change do
    drop table(:host_connection_settings)
  end
end

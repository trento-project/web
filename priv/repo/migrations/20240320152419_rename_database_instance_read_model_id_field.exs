# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RenameDatabaseInstanceReadModelIdField do
  use Ecto.Migration

  def change do
    rename table("database_instances"), :sap_system_id, to: :database_id
  end
end

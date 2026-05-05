# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RemoveHostConnectionSettings do
  use Ecto.Migration

  def change do
    drop table(:host_connection_settings)
  end
end

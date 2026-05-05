# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.AddTenantsDatabaseIndex do
  use Ecto.Migration

  def up do
    execute("CREATE INDEX databases_tenants ON databases USING GIN(tenants)")
  end

  def down do
    execute("DROP INDEX databases_tenants")
  end
end

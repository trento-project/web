# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.SetEnsaVersionInitialValueToSapSystemReadModel do
  use Ecto.Migration

  def change do
    execute "UPDATE sap_systems SET ensa_version = 'no_ensa'"
  end
end

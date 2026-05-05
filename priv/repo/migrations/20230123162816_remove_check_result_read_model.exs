# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RemoveCheckResultReadModel do
  use Ecto.Migration

  def change do
    drop table(:checks_results)
  end
end

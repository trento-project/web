# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.RemoveCheckResultReadModel do
  use Ecto.Migration

  def change do
    drop table(:checks_results)
  end
end

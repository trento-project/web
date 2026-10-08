# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameCheckCustomizationAbility do
  use Ecto.Migration

  def change do
    execute(
      """
      UPDATE abilities
      SET resource = 'checks_customization'
      WHERE name = 'all' AND resource = 'check_customization';
      """,
      """
      UPDATE abilities
      SET resource = 'check_customization'
      WHERE name = 'all' AND resource = 'checks_customization';
      """
    )
  end
end

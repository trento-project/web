defmodule Trento.Repo.Migrations.DropFunWithFlagsTable do
  use Ecto.Migration

  def change do
    drop table(:fun_with_flags_toggles)
  end
end

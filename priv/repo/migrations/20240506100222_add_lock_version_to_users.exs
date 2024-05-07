defmodule Trento.Repo.Migrations.AddLockVersionToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :lock_version, :integer, default: 1
    end
  end
end

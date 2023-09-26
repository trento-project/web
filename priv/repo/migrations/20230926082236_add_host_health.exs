defmodule Trento.Repo.Migrations.AddHostHealth do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :health, :string
    end
  end
end

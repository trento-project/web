defmodule Trento.Repo.Migrations.AddHostArch do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :arch, :string
    end
  end
end

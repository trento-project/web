defmodule Trento.Repo.Migrations.AddSelectedChecksToHosts do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :selected_checks, {:array, :string}, default: []
    end
  end
end

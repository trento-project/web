defmodule Tronto.Repo.Migrations.AddSelectedChecksToCluster do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :selected_checks, {:array, :string}
    end
  end
end

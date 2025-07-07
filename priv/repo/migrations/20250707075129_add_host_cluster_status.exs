defmodule Trento.Repo.Migrations.AddHostClusterStatus do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :cluster_status, :string
    end

    execute(
      "UPDATE hosts SET cluster_status = 'online' WHERE cluster_status IS NOT NULL",
      "UPDATE hosts SET cluster_status = NULL"
    )
  end
end

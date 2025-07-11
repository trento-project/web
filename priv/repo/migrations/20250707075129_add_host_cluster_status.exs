defmodule Trento.Repo.Migrations.AddHostClusterStatus do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :cluster_host_status, :string
    end

    execute(
      "UPDATE hosts SET cluster_host_status = 'online' WHERE cluster_id IS NOT NULL",
      "UPDATE hosts SET cluster_host_status = NULL"
    )
  end
end

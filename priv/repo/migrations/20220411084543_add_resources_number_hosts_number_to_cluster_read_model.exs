defmodule Trento.Repo.Migrations.AddResourcesNumberHostsNumberToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :resources_number, :integer
      add :hosts_number, :integer
    end
  end
end

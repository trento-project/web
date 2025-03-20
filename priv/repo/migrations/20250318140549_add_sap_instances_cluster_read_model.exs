defmodule Trento.Repo.Migrations.AddSapInstancesClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :sap_instances, :map
    end
  end
end

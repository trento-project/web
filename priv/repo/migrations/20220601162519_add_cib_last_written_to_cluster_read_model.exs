defmodule Trento.Repo.Migrations.AddCibLastWrittenToClusterReadModel do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :cib_last_written, :string
    end
  end
end

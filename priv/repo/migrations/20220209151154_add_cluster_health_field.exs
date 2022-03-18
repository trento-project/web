defmodule Trento.Repo.Migrations.AddClusterHealthField do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :health, :string
    end
  end
end

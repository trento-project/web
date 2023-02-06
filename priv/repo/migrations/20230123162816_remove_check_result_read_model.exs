defmodule Trento.Repo.Migrations.RemoveCheckResultReadModel do
  use Ecto.Migration

  def change do
    drop table(:checks_results)
  end
end

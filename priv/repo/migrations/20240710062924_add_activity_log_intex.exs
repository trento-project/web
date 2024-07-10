defmodule Trento.Repo.Migrations.AddActivityLogIntex do
  use Ecto.Migration

  def change do
    create index(:activity_logs, [:inserted_at])
  end
end

defmodule Trento.Repo.Migrations.AddActivityLogIndex do
  use Ecto.Migration

  def change do
    create index(:activity_logs, [:type])
    create index(:activity_logs, [:actor])
  end
end

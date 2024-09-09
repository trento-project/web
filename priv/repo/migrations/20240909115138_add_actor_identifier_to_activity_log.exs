defmodule Trento.Repo.Migrations.AddActorIdentifierToActivityLog do
  use Ecto.Migration

  def change() do
    alter table(:activity_logs) do
      # add :actor_id, references(:users, name: :user_id, on_delete: :nothing)
      add :actor_id, :integer, nullable: true
    end
  end
end

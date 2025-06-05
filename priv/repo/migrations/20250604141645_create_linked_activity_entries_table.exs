defmodule Trento.Repo.Migrations.CreateLinkedActivityEntriesTable do
  use Ecto.Migration

  def change do
    create table(:linked_activity_entries, primary_key: false) do
      add :entry_id, :uuid, primary_key: true
      add :parent_entry_ids, {:array, :binary}
      add :child_entry_ids, {:array, :binary}

      timestamps()
    end
  end
end

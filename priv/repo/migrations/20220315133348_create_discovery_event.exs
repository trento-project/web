defmodule Trento.Repo.Migrations.AddDiscoveryEvent do
  use Ecto.Migration

  def change do
    create table(:discovery_events) do
      add :agent_id, :uuid
      add :discovery_type, :string
      add :payload, :map

      timestamps()
    end
  end
end

defmodule Trento.Repo.Migrations.AddAcceptedFieldToDiscoveryEvents do
  use Ecto.Migration

  def change do
    alter table(:discovery_events) do
      add :accepted, :boolean
    end
  end
end

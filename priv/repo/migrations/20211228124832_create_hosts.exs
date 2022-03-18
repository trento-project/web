defmodule Trento.Repo.Migrations.CreateHosts do
  use Ecto.Migration

  def change do
    create table(:hosts, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :hostname, :string
      add :ip_addresses, {:array, :string}
      add :agent_version, :string
      add :heartbeat, :string
    end
  end
end

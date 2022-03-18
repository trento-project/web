defmodule Trento.Repo.Migrations.CreateSlesSubscriptionReadModel do
  use Ecto.Migration

  def change do
    create table(:sles_subscriptions, primary_key: false) do
      add :host_id, :uuid, primary_key: true
      add :identifier, :string, primary_key: true
      add :version, :string
      add :arch, :string
      add :status, :string
      add :subscription_status, :string
      add :type, :string
      add :starts_at, :string
      add :expires_at, :string

      timestamps()
    end

    create index(:sles_subscriptions, [:host_id])
  end
end

defmodule Trento.Repo.Migrations.CreateHostConnectionSettings do
  use Ecto.Migration

  def change do
    create table(:host_connection_settings, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :user, :string
    end
  end
end

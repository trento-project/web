defmodule Trento.Repo.Migrations.AddProviderField do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :provider, :string
    end
  end
end

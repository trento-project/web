defmodule Trento.Repo.Migrations.AddNetmasksToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :ip_addresses_netmasks, {:array, :string}
    end
  end
end

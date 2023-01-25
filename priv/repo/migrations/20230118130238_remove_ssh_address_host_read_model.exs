defmodule Trento.Repo.Migrations.RemoveSshAddressHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      remove :ssh_address
    end
  end
end

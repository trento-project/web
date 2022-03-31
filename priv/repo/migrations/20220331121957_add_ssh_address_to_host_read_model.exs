defmodule Trento.Repo.Migrations.AddSshAddressToHostReadModel do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :ssh_address, :string
    end
  end
end

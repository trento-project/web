defmodule Trento.Repo.Migrations.AddHostsFqdn do
  use Ecto.Migration

  def change do
    alter table(:hosts) do
      add :fully_qualified_domain_name, :string
    end
  end
end

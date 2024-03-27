defmodule Trento.Repo.Migrations.DeleteSapSystemEntries do
  use Ecto.Migration

  def change do
    execute "DELETE FROM sap_systems"
    execute "DELETE FROM application_instances"
  end
end

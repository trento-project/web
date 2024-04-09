defmodule Trento.Repo.Migrations.DeleteSapSystemEntries do
  use Ecto.Migration

  def change do
    execute(&execute_up/0, &execute_down/0)
  end

  defp execute_up do
    repo().delete_all("sap_systems")
    repo().delete_all("application_instances")
  end

  defp execute_down, do: nil
end

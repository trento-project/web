defmodule TrentoWeb.SapSystemView do
  use TrentoWeb, :view

  def render("databases.json", %{databases: databases}) do
    render_many(databases, __MODULE__, "database.json", as: :database)
  end

  def render("database.json", %{database: database}) do
    add_system_replication_status_to_secondary_instance(database)
  end

  def render("sap_systems.json", %{sap_systems: sap_systems}) do
    render_many(sap_systems, __MODULE__, "sap_system.json")
  end

  def render("sap_system.json", %{sap_system: sap_system}) do
    add_system_replication_status_to_secondary_instance(sap_system)
  end

  defp add_system_replication_status_to_secondary_instance(
         %{database_instances: database_instances} = sap_system
       ) do
    system_replication_status =
      Enum.find_value(database_instances, fn
        %{
          system_replication: "Primary",
          system_replication_status: system_replication_status
        } ->
          system_replication_status

        _ ->
          false
      end)

    database_instances =
      Enum.map(database_instances, fn
        %{
          system_replication: "Secondary"
        } = instance ->
          %{instance | system_replication_status: system_replication_status}

        %{system_replication: "Primary"} = instance ->
          %{instance | system_replication_status: ""}

        instance ->
          instance
      end)

    Map.put(sap_system, :database_instances, database_instances)
  end
end

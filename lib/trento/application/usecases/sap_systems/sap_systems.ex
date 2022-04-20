defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems and HANA Databases.
  """

  import Ecto.Query

  alias Trento.{
    DatabaseReadModel,
    SapSystemReadModel
  }

  alias Trento.Repo

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload(:application_instances)
    |> Repo.preload(:database_instances)
    |> Repo.preload(:tags)
    |> Enum.map(&add_system_replication_status_to_secondary_instance/1)
  end

  @spec get_all_databases :: [map]
  def get_all_databases do
    DatabaseReadModel
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload(:database_instances)
    |> Repo.preload(:tags)
    |> Enum.map(&add_system_replication_status_to_secondary_instance/1)
  end

  defp add_system_replication_status_to_secondary_instance(
         %{database_instances: database_instances} = read_model
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

    Map.put(read_model, :database_instances, database_instances)
  end
end

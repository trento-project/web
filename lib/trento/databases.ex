defmodule Trento.Databases do
  @moduledoc """
  Provides a set of functions to interact with databases.
  """

  import Ecto.Query

  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.Infrastructure.Operations

  alias Trento.Support.DateService

  alias Trento.Databases.Commands.DeregisterDatabaseInstance

  alias Trento.Repo

  @spec by_id(String.t()) :: {:ok, DatabaseReadModel.t()} | {:error, :not_found}
  def by_id(id) do
    case Repo.get(DatabaseReadModel, id) do
      %DatabaseReadModel{} = database -> {:ok, database}
      nil -> {:error, :not_found}
    end
  end

  @spec get_database_by_id(String.t()) :: DatabaseReadModel.t() | nil
  def get_database_by_id(id) do
    DatabaseReadModel
    |> where([c], c.id == ^id and is_nil(c.deregistered_at))
    |> Repo.one()
  end

  @spec get_all_databases :: [DatabaseReadModel.t()]
  def get_all_databases do
    DatabaseReadModel
    |> where([d], is_nil(d.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :database_instances,
      :tags
    ])
  end

  @spec get_database_instances_by_id(String.t()) :: [DatabaseInstanceReadModel.t()]
  def get_database_instances_by_id(id) do
    DatabaseInstanceReadModel
    |> where([d], d.database_id == ^id)
    |> Repo.all()
  end

  @spec get_database_instances_by_host_id(String.t()) :: [DatabaseInstanceReadModel.t()]
  def get_database_instances_by_host_id(host_id) do
    DatabaseInstanceReadModel
    |> where([d], d.host_id == ^host_id)
    |> Repo.all()
  end

  @spec deregister_database_instance(Ecto.UUID.t(), Ecto.UUID.t(), String.t(), DateService) ::
          :ok | {:error, :instance_present} | {:error, :database_instance_not_registered}
  def deregister_database_instance(
        database_id,
        host_id,
        instance_number,
        date_service \\ DateService
      ) do
    case Repo.get_by(DatabaseInstanceReadModel,
           database_id: database_id,
           host_id: host_id,
           instance_number: instance_number
         ) do
      %DatabaseInstanceReadModel{absent_at: nil} ->
        {:error, :instance_present}

      _ ->
        correlated_dispatch(
          DeregisterDatabaseInstance.new!(%{
            database_id: database_id,
            host_id: host_id,
            instance_number: instance_number,
            deregistered_at: date_service.utc_now()
          })
        )
    end
  end

  @spec request_operation(atom(), Ecto.UUID.t(), map()) ::
          {:ok, String.t()} | {:error, any}
  def request_operation(operation, database_id, params)
      when operation in DatabaseOperations.values() do
    operation_id = UUID.uuid4()

    # Look for 1st running host to send the operation including the instance_number
    # If there is not any running host, the request is sent to the first instance
    # Not checking if the database is deregistered. That must be done by the function user
    instances =
      database_id
      |> get_database_instances_by_id()
      |> maybe_filter_by_site(params)
      |> Repo.preload([:host])

    targets =
      instances
      |> Enum.find(Enum.at(instances, 0), fn %{
                                               absent_at: absent_at,
                                               host: %{heartbeat: heartbeat}
                                             } ->
        heartbeat == :passing && absent_at == nil
      end)
      |> case do
        nil ->
          # Corner case scenario. We shouldn't have databases without db instances
          []

        %{host_id: host_id, instance_number: instance_number} ->
          [%{agent_id: host_id, arguments: Map.put(params, :instance_number, instance_number)}]
      end

    case Operations.request_operation(
           operation_id,
           database_id,
           Operations.map_operation(operation),
           targets
         ) do
      :ok -> {:ok, operation_id}
      error -> error
    end
  end

  def request_operation(_, _, _), do: {:error, :operation_not_found}

  defp maybe_filter_by_site(databases, %{site: site}) when not is_nil(site) do
    Enum.filter(databases, fn %{system_replication_site: current_site} -> site == current_site end)
  end

  defp maybe_filter_by_site(databases, _), do: databases

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  defp correlated_dispatch(command) do
    correlation_id = Process.get(:correlation_id)
    commanded().dispatch(command, correlation_id: correlation_id, causation_id: correlation_id)
  end
end

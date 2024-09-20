defmodule Trento.Databases do
  @moduledoc """
  Provides a set of functions to interact with databases.
  """

  import Ecto.Query

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

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
        commanded().dispatch(
          DeregisterDatabaseInstance.new!(%{
            database_id: database_id,
            host_id: host_id,
            instance_number: instance_number,
            deregistered_at: date_service.utc_now()
          })
        )
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

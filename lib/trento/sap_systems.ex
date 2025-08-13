defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems.
  """

  import Ecto.Query

  require Trento.Operations.Enums.SapInstanceOperations, as: SapInstanceOperations
  require Trento.Operations.Enums.SapSystemOperations, as: SapSystemOperations

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Infrastructure.Operations

  alias Trento.Support.CommandedUtils
  alias Trento.Support.DateService

  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  alias Trento.Repo

  @spec by_id(String.t()) :: {:ok, SapSystemReadModel.t()} | {:error, :not_found}
  def by_id(id) do
    case Repo.get(SapSystemReadModel, id) do
      %SapSystemReadModel{} = sap_system -> {:ok, sap_system}
      nil -> {:error, :not_found}
    end
  end

  @spec get_sap_system_by_id(String.t()) :: SapSystemReadModel.t() | nil
  def get_sap_system_by_id(id) do
    SapSystemReadModel
    |> where([c], c.id == ^id and is_nil(c.deregistered_at))
    |> Repo.one()
  end

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :application_instances,
      :database,
      :database_instances,
      :tags
    ])
  end

  @spec get_application_instances_by_id(String.t()) :: [ApplicationInstanceReadModel.t()]
  def get_application_instances_by_id(id) do
    ApplicationInstanceReadModel
    |> where([s], s.sap_system_id == ^id)
    |> Repo.all()
  end

  @spec get_application_instances_by_host_id(String.t()) :: [ApplicationInstanceReadModel.t()]
  def get_application_instances_by_host_id(host_id) do
    ApplicationInstanceReadModel
    |> where([a], a.host_id == ^host_id)
    |> Repo.all()
  end

  @spec deregister_application_instance(Ecto.UUID.t(), Ecto.UUID.t(), String.t(), DateService) ::
          :ok | {:error, :instance_present} | {:error, :application_instance_not_registered}
  def deregister_application_instance(
        sap_system_id,
        host_id,
        instance_number,
        date_service \\ DateService
      ) do
    case Repo.get_by(ApplicationInstanceReadModel,
           sap_system_id: sap_system_id,
           host_id: host_id,
           instance_number: instance_number
         ) do
      %ApplicationInstanceReadModel{absent_at: nil} ->
        {:error, :instance_present}

      _ ->
        CommandedUtils.correlated_dispatch(
          DeregisterApplicationInstance.new!(%{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number,
            deregistered_at: date_service.utc_now()
          })
        )
    end
  end

  @spec request_instance_operation(atom(), Ecto.UUID.t(), String.t(), map()) ::
          {:ok, String.t()} | {:error, any}
  def request_instance_operation(operation, host_id, instance_number, params)
      when operation in SapInstanceOperations.values() do
    operation_id = UUID.uuid4()
    arguments = Map.put(params, :instance_number, instance_number)

    case Operations.request_operation(
           operation_id,
           host_id,
           Operations.map_operation(operation),
           [%{agent_id: host_id, arguments: arguments}]
         ) do
      :ok -> {:ok, operation_id}
      error -> error
    end
  end

  def request_instance_operation(_, _, _, _), do: {:error, :operation_not_found}

  @spec request_operation(atom(), Ecto.UUID.t(), map()) ::
          {:ok, String.t()} | {:error, any}
  def request_operation(operation, sap_system_id, params)
      when operation in SapSystemOperations.values() do
    operation_id = UUID.uuid4()

    # Look for 1st running host to send the operation including the instance_number
    # If there is not any running host, the request is sent to the first instance
    # Not checking if the SAP system is deregistered. That must be done by the function user
    instances =
      sap_system_id
      |> get_application_instances_by_id()
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
          # Corner case scenario. We shouldn't have SAP systems without app instances
          []

        %{host_id: host_id, instance_number: instance_number} ->
          [%{agent_id: host_id, arguments: Map.put(params, :instance_number, instance_number)}]
      end

    case Operations.request_operation(
           operation_id,
           sap_system_id,
           Operations.map_operation(operation),
           targets
         ) do
      :ok -> {:ok, operation_id}
      error -> error
    end
  end

  def request_operation(_, _, _), do: {:error, :operation_not_found}
end

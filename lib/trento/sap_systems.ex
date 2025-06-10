defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems.
  """

  import Ecto.Query

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Infrastructure.Operations

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
        commanded().dispatch(
          DeregisterApplicationInstance.new!(%{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number,
            deregistered_at: date_service.utc_now()
          })
        )
    end
  end

  @spec request_operation(atom(), String.t(), map()) :: {:ok, String.t()} | {:error, any}
  def request_operation(operation, _, %{host_id: host_id} = params)
      when operation in [:sap_instance_start, :sap_instance_stop] do
    operation_id = UUID.uuid4()
    arguments = Map.delete(params, :host_id)

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

  def request_operation(_, _, _), do: {:error, :operation_not_found}

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems.
  """

  import Ecto.Query

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Support.DateService

  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  alias Trento.Repo

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :application_instances,
      :database_instances,
      :tags
    ])
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

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

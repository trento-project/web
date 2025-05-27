defmodule Trento.Infrastructure.Commanded.EventHandlers.SaptuneStatusUpdateEventHandler do
  @moduledoc """
  Event handler to update saptune status when application or HANA database instances are registered/deregistered.
  A host saptune health depends on SAP instances running on the host, so any update on that
  needs to be applied in the saptune state health.

  Full deregistration and restoration is handled as well, as some instances might still be in the
  database as they might not be explicitly cleaned up.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "saptune_status_update_event_handler"

  import Ecto.Query

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseInstanceDeregistered,
    DatabaseInstanceRegistered,
    DatabaseRestored
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceRegistered,
    SapSystemDeregistered,
    SapSystemRestored
  }

  alias Trento.Hosts
  alias Trento.Hosts.Commands.UpdateSaptuneStatus
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  alias Trento.Repo

  def handle(
        %DatabaseInstanceRegistered{
          host_id: host_id
        },
        _
      ) do
    host_id
    |> Hosts.get_host_by_id()
    |> maybe_dispatch_update_saptune_status(true)
  end

  def handle(
        %ApplicationInstanceRegistered{
          host_id: host_id
        },
        _
      ) do
    host_id
    |> Hosts.get_host_by_id()
    |> maybe_dispatch_update_saptune_status(true)
  end

  def handle(
        %DatabaseInstanceDeregistered{
          host_id: host_id,
          instance_number: instance_number
        },
        _
      ) do
    host_id
    |> Hosts.get_host_by_id()
    |> handle_deregistered([instance_number])
  end

  def handle(
        %ApplicationInstanceDeregistered{
          host_id: host_id,
          instance_number: instance_number
        },
        _
      ) do
    host_id
    |> Hosts.get_host_by_id()
    |> handle_deregistered([instance_number])
  end

  def handle(
        %DatabaseDeregistered{
          database_id: database_id
        },
        _
      ) do
    DatabaseInstanceReadModel
    |> where([d], d.database_id == ^database_id)
    |> Repo.all()
    |> handle_instances_deregistered(false)
  end

  def handle(
        %SapSystemDeregistered{
          sap_system_id: sap_system_id
        },
        _
      ) do
    ApplicationInstanceReadModel
    |> where([s], s.sap_system_id == ^sap_system_id)
    |> Repo.all()
    |> handle_instances_deregistered(false)
  end

  def handle(
        %DatabaseRestored{
          database_id: database_id
        },
        _
      ) do
    DatabaseInstanceReadModel
    |> where([d], d.database_id == ^database_id)
    |> Repo.all()
    |> handle_instances_deregistered(true)
  end

  def handle(
        %SapSystemRestored{
          sap_system_id: sap_system_id
        },
        _
      ) do
    ApplicationInstanceReadModel
    |> where([s], s.sap_system_id == ^sap_system_id)
    |> Repo.all()
    |> handle_instances_deregistered(true)
  end

  defp maybe_dispatch_update_saptune_status(nil, _), do: :ok

  defp maybe_dispatch_update_saptune_status(
         %HostReadModel{id: host_id, saptune_status: nil},
         sap_running
       ) do
    commanded().dispatch(%UpdateSaptuneStatus{
      host_id: host_id,
      package_version: nil,
      saptune_installed: false,
      sap_running: sap_running,
      status: nil
    })
  end

  defp maybe_dispatch_update_saptune_status(
         %HostReadModel{
           id: host_id,
           saptune_status: %{package_version: version} = status
         },
         sap_running
       ) do
    commanded().dispatch(%UpdateSaptuneStatus{
      host_id: host_id,
      package_version: version,
      saptune_installed: true,
      sap_running: sap_running,
      status: status
    })
  end

  # instance_numbers variable is used to reject the instance with that number from the check
  # to see if SAP is running or not
  defp handle_deregistered(host, instance_numbers) do
    sap_running =
      host
      |> Repo.preload([:application_instances, :database_instances])
      |> sap_running?(instance_numbers)

    maybe_dispatch_update_saptune_status(host, sap_running)
  end

  # get all unique hosts from the instances and handle deregistration on them
  # if restoration is set to true the instance is not discarded from the SAP running check
  defp handle_instances_deregistered(instances, restoration) do
    instances
    |> Repo.preload([:host])
    |> Enum.map(fn %{host: host} -> host end)
    |> Enum.uniq_by(fn %{id: host_id} -> host_id end)
    |> Enum.each(fn %{id: host_id} = host ->
      instance_numbers =
        instances
        |> Enum.filter(fn %{host_id: inst_host_id} -> inst_host_id == host_id end)
        |> Enum.map(fn %{instance_number: inst_number} -> inst_number end)

      inst_number = if restoration, do: [], else: instance_numbers
      handle_deregistered(host, inst_number)
    end)
  end

  defp sap_running?(nil, _), do: false

  defp sap_running?(
         %HostReadModel{application_instances: app_instances, database_instances: db_instances},
         instance_numbers
       ) do
    app_instances
    |> Enum.concat(db_instances)
    # rejecting current instance as maybe the instance is not removed from the db yet
    |> Enum.reject(fn %{instance_number: inst_number} -> inst_number in instance_numbers end)
    |> Enum.empty?()
    |> Kernel.not()
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

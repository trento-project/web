defmodule Trento.Operations.DatabasePolicy do
  @moduledoc """
  DatabaseReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations

  alias Trento.Support.OperationsHelper

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.Hosts.Projections.HostReadModel

  # for all operations, check the heartbeat of all the hosts composing the database
  # authorize if at least one host heartbeat is passing
  # if a site is given, it is used to filter the list of instances in that site
  def authorize_operation(
        operation,
        %DatabaseReadModel{database_instances: instances} = database,
        params
      )
      when operation in DatabaseOperations.values() do
    some_heartbeat_passing? =
      instances
      |> filter_by_site(params)
      |> Enum.any?(fn %DatabaseInstanceReadModel{host: %HostReadModel{heartbeat: heartbeat}} ->
        heartbeat == :passing
      end)

    if some_heartbeat_passing? do
      do_authorize_operation(operation, database, params)
    else
      {:error, get_heatbeat_not_passing_forbidden_msg(params)}
    end
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp filter_by_site(instances, %{site: nil}), do: instances

  defp filter_by_site(instances, %{site: params_site}),
    do: Enum.filter(instances, fn %{system_replication_site: site} -> site == params_site end)

  defp filter_by_site(instances, _), do: instances

  defp get_heatbeat_not_passing_forbidden_msg(%{site: site}) when not is_nil(site),
    do: ["Trento agent is not currently running in any of the hosts in the database site #{site}"]

  defp get_heatbeat_not_passing_forbidden_msg(_),
    do: ["Trento agent is not currently running in any of the hosts in the database"]

  defp do_authorize_operation(
         :database_start,
         %DatabaseReadModel{} = database,
         params
       ) do
    primary_site = get_primary_site(database)

    OperationsHelper.reduce_operation_authorizations([
      database_instances_cluster_maintenance(database),
      primary_site_started(database, params, primary_site)
    ])
  end

  defp do_authorize_operation(
         :database_stop,
         %DatabaseReadModel{} = database,
         params
       ) do
    primary_site = get_primary_site(database)

    OperationsHelper.reduce_operation_authorizations([
      database_instances_cluster_maintenance(database),
      secondary_sites_stopped(database, params, primary_site),
      application_instances_stopped(database, params, primary_site)
    ])
  end

  defp get_primary_site(%DatabaseReadModel{
         database_instances: database_instances
       }) do
    Enum.find_value(database_instances, nil, fn %{
                                                  system_replication: sr,
                                                  system_replication_site: site
                                                } ->
      if sr == "Primary" do
        site
      end
    end)
  end

  defp database_instances_cluster_maintenance(%DatabaseReadModel{
         database_instances: database_instances
       }) do
    OperationsHelper.reduce_operation_authorizations(
      database_instances,
      :ok,
      fn database_instance ->
        DatabaseInstanceReadModel.authorize_operation(
          :cluster_maintenance,
          database_instance,
          %{}
        )
      end
    )
  end

  # system replication not configured
  defp primary_site_started(_, _, nil), do: :ok
  # primary site
  defp primary_site_started(_, %{site: site}, site), do: :ok
  # secondary sites, check primary is started
  defp primary_site_started(
         %DatabaseReadModel{
           sid: sid,
           database_instances: database_instances
         },
         _,
         primary_site
       ) do
    database_instances
    |> Enum.filter(fn %{system_replication_site: site} -> site == primary_site end)
    |> Enum.all?(fn %{health: health} -> health == :passing end)
    |> if do
      :ok
    else
      {:error, ["Primary site #{primary_site} of database #{sid} is not started"]}
    end
  end

  # system replication not configured
  defp secondary_sites_stopped(_, _, nil), do: :ok
  # primary site, check secondary sites are stopped
  defp secondary_sites_stopped(
         %DatabaseReadModel{
           sid: sid,
           database_instances: database_instances
         },
         %{site: primary_site},
         primary_site
       ) do
    database_instances
    |> Enum.reject(fn %{system_replication_site: site} -> site == primary_site end)
    |> Enum.all?(fn %{health: health} -> health == :unknown end)
    |> if do
      :ok
    else
      {:error, ["Secondary sites of database #{sid} are not stopped"]}
    end
  end

  # secondary sites
  defp secondary_sites_stopped(_, _, _), do: :ok

  defp application_instances_stopped(%DatabaseReadModel{sap_systems: []}, _, _), do: :ok

  # system replication not configured, check if app instances are stopped
  defp application_instances_stopped(
         %DatabaseReadModel{sap_systems: sap_systems},
         _,
         nil
       ) do
    sap_systems
    |> Enum.flat_map(fn %{application_instances: app_instances} -> app_instances end)
    |> Enum.filter(fn %{health: health, features: features} ->
      health != :unknown and (features =~ "ABAP" or features =~ "J2EE")
    end)
    |> case do
      [] ->
        :ok

      running_instances ->
        {:error,
         Enum.map(running_instances, fn %{sid: sid, instance_number: inst_number} ->
           "Instance #{inst_number} of SAP system #{sid} is not stopped"
         end)}
    end
  end

  # primary site (same as without system replication), check if app instances are stopped
  defp application_instances_stopped(
         database,
         %{site: site},
         site
       ),
       do: application_instances_stopped(database, nil, nil)

  # secondary site
  defp application_instances_stopped(_, _, _), do: :ok
end

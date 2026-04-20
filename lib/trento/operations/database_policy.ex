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
  # authorize if at least one host heartbeat per system replication site is passing
  # if a site is given, it is used to filter the list of instances in that site
  def authorize_operation(
        operation,
        %DatabaseReadModel{database_instances: instances} = database,
        params
      )
      when operation in DatabaseOperations.values() do
    site_instances = filter_by_site(instances, params)

    sites_without_passing_heartbeat =
      site_instances
      |> Enum.group_by(& &1.system_replication_site)
      |> Enum.reject(fn {_site, grouped_instances} ->
        Enum.any?(grouped_instances, fn %DatabaseInstanceReadModel{
                                          host: %HostReadModel{heartbeat: heartbeat}
                                        } ->
          heartbeat == :passing
        end)
      end)
      |> Enum.map(fn {site, _} -> site end)

    with :ok <- validate_site_exists(site_instances, params),
         :ok <- validate_heartbeats(sites_without_passing_heartbeat) do
      do_authorize_operation(operation, database, params)
    end
  end

  def authorize_operation(_, _, _),
    do: {:error, [OperationsHelper.build_error("Unknown operation")]}

  defp filter_by_site(instances, %{site: nil}), do: instances

  defp filter_by_site(instances, %{site: params_site}),
    do: Enum.filter(instances, fn %{system_replication_site: site} -> site == params_site end)

  defp filter_by_site(instances, _), do: instances

  defp validate_site_exists([], %{site: site}),
    do:
      {:error,
       [
         OperationsHelper.build_error("Requested site #{site} is not found in the database")
       ]}

  defp validate_site_exists(_instances, _params), do: :ok

  defp validate_heartbeats([]), do: :ok

  defp validate_heartbeats(sites_without_passing_heartbeat) do
    {:error,
     Enum.map(sites_without_passing_heartbeat, fn
       nil ->
         OperationsHelper.build_error(
           "Trento agent is not currently running in any of the hosts in the database"
         )

       site ->
         OperationsHelper.build_error(
           "Trento agent is not currently running in any of the hosts in the database site #{site}"
         )
     end)}
  end

  defp do_authorize_operation(
         :database_start,
         %DatabaseReadModel{} = database,
         params
       ) do
    primary_site = get_primary_site(database)

    OperationsHelper.reduce_operation_authorizations([
      database_instances_cluster_maintenance(database, params),
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
      database_instances_cluster_maintenance(database, params),
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

  defp database_instances_cluster_maintenance(
         %DatabaseReadModel{
           database_instances: database_instances
         },
         params
       ) do
    database_instances
    |> filter_by_site(params)
    |> OperationsHelper.reduce_operation_authorizations(
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
  # full database request
  defp primary_site_started(_, params, _) when not is_map_key(params, :site), do: :ok
  defp primary_site_started(_, %{site: nil}, _), do: :ok
  # primary site
  defp primary_site_started(_, %{site: site}, site), do: :ok
  # secondary sites, check primary of this site is started.
  # for that, check site instances with the previous tier number are started.
  # for example: to start tier 3 check if tier 2 instances are started.
  # this policy is sub-optimal as it doesn't handle well a potential multi-target + multi-tier setup.
  # in that scenario, the policy would check all instances in 2nd tier, without filtering only
  # replicated sites by the 3rd tier site.
  defp primary_site_started(
         %DatabaseReadModel{
           sid: sid,
           database_instances: database_instances
         },
         %{site: site},
         _
       ) do
    requested_site_tier =
      Enum.find_value(database_instances, 0, fn %{
                                                  system_replication_tier: tier,
                                                  system_replication_site: inst_site
                                                } ->
        if site == inst_site do
          tier
        end
      end)

    database_instances
    |> Enum.filter(fn %{system_replication_tier: tier} -> tier == requested_site_tier - 1 end)
    |> Enum.all?(fn %{health: health} -> health == :passing end)
    |> if do
      :ok
    else
      {:error,
       [
         OperationsHelper.build_error(
           "Primary site of #{site} in database #{sid} is not started",
           []
         )
       ]}
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
         %{site: site},
         _
       ) do
    database_instances
    |> Enum.filter(fn %{system_replication_source_site: source_site} -> site == source_site end)
    |> Enum.all?(fn %{health: health} -> health == :unknown end)
    |> if do
      :ok
    else
      {:error,
       [
         OperationsHelper.build_error(
           "Secondary sites for site #{site} in database #{sid} are not stopped",
           []
         )
       ]}
    end
  end

  # secondary sites or full database stop request
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
         Enum.map(running_instances, fn %{
                                          sap_system_id: app_id,
                                          sid: sid,
                                          instance_number: inst_number
                                        } ->
           OperationsHelper.build_error(
             "Instance #{inst_number} of SAP system {0} is not stopped",
             [%{id: app_id, label: sid, type: :sap_system}]
           )
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

  # full database stop request, check if app instances are stopped
  defp application_instances_stopped(database, params, _) when not is_map_key(params, :site),
    do: application_instances_stopped(database, nil, nil)

  defp application_instances_stopped(database, %{site: nil}, _),
    do: application_instances_stopped(database, nil, nil)

  # secondary site
  defp application_instances_stopped(_, _, _), do: :ok
end

defmodule Trento.Operations.DatabasePolicy do
  @moduledoc """
  DatabaseReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Support.OperationsHelper

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  def authorize_operation(
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

  def authorize_operation(
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

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

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

  # secondary site
  defp application_instances_stopped(_, %{site: site}, primary_site)
       when site != primary_site,
       do: :ok

  # primary site or database without system replication, check if app instances are stopped
  # this includes scenarios where "site" param is not given or is nil as well
  defp application_instances_stopped(
         %DatabaseReadModel{sap_systems: sap_systems},
         _,
         _
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
end

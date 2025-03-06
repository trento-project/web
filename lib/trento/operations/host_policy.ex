defmodule Trento.Operations.HostPolicy do
  @moduledoc """
  HostReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Support.OperationsHelper

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # saptune_solution_apply operation authorized when:
  # - all SAP instances are authorized for maintenance
  def authorize_operation(
        :saptune_solution_apply,
        %HostReadModel{
          cluster: cluster,
          application_instances: application_instances,
          database_instances: database_instances
        } = host,
        _
      ) do
    applications_maintenance_authorized =
      application_instances
      |> Enum.map(fn application_instance ->
        %ApplicationInstanceReadModel{application_instance | host: host}
      end)
      |> OperationsHelper.reduce_operation_authorizations(:ok, fn application_instance ->
        ApplicationInstanceReadModel.authorize_operation(:maintenance, application_instance, %{
          cluster_resource_id: nil
        })
      end)

    # Get SAPHana or SapHanaController master resource id
    cluster_resource_id = get_saptune_operation_resource_id(cluster)

    database_instances
    |> Enum.map(fn database_instances ->
      %DatabaseInstanceReadModel{database_instances | host: host}
    end)
    |> OperationsHelper.reduce_operation_authorizations(
      applications_maintenance_authorized,
      fn database_instances ->
        DatabaseInstanceReadModel.authorize_operation(:maintenance, database_instances, %{
          cluster_resource_id: cluster_resource_id
        })
      end
    )
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp get_saptune_operation_resource_id(%ClusterReadModel{
         details: %{nodes: nodes}
       }) do
    Enum.find_value(nodes, nil, fn %{resources: resources} ->
      Enum.find_value(resources, nil, &find_resource_id/1)
    end)
  end

  defp get_saptune_operation_resource_id(_), do: nil

  # Classic SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHana", parent: %{id: id}}), do: id
  # Angi SAP HANA setup
  defp find_resource_id(%{type: "ocf::suse:SAPHanaController", parent: %{id: id}}), do: id
  defp find_resource_id(_), do: nil
end

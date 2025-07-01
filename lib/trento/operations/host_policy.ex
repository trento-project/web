defmodule Trento.Operations.HostPolicy do
  @moduledoc """
  HostReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.Support.OperationsHelper

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  # saptune_solution_apply and saptune_solution_change operation authorized when:
  # - all SAP instances are authorized for maintenance
  def authorize_operation(
        operation,
        %HostReadModel{
          application_instances: application_instances,
          database_instances: database_instances,
          saptune_status: saptune_status
        } = host,
        _
      )
      when operation in [:saptune_solution_apply, :saptune_solution_change] do
    applications_maintenance_authorized =
      application_instances
      |> Enum.map(fn application_instance ->
        %ApplicationInstanceReadModel{application_instance | host: host}
      end)
      |> OperationsHelper.reduce_operation_authorizations(:ok, fn application_instance ->
        ApplicationInstanceReadModel.authorize_operation(:maintenance, application_instance, %{})
      end)

    databases_authorized =
      database_instances
      |> Enum.map(fn database_instances ->
        %DatabaseInstanceReadModel{database_instances | host: host}
      end)
      |> OperationsHelper.reduce_operation_authorizations(
        applications_maintenance_authorized,
        fn database_instances ->
          DatabaseInstanceReadModel.authorize_operation(:maintenance, database_instances, %{})
        end
      )

    operation
    |> authorize_saptune_solution_operation(saptune_status)
    |> List.wrap()
    |> OperationsHelper.reduce_operation_authorizations(databases_authorized)
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}

  defp authorize_saptune_solution_operation(:saptune_solution_apply, nil), do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_apply, %{applied_solution: nil}),
    do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_apply, _),
    do:
      {:error,
       ["Cannot apply the requested solution because there is an already applied on this host"]}

  defp authorize_saptune_solution_operation(:saptune_solution_change, %{
         applied_solution: applied_solution
       })
       when not is_nil(applied_solution),
       do: :ok

  defp authorize_saptune_solution_operation(:saptune_solution_change, _),
    do:
      {:error,
       [
         "Cannot change the requested solution because there is no currently applied one on this host"
       ]}
end

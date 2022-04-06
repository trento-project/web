defmodule Trento.CheckResultProjector do
  @moduledoc """
  Check result projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "check_result_projector"

  import Ecto.Query

  alias Trento.Domain.Events.{
    ChecksExecutionRequested,
    HostChecksExecutionCompleted,
    HostChecksExecutionUnreachable
  }

  alias Trento.{
    CheckResultReadModel,
    HostChecksResultsReadModel
  }

  project(
    %ChecksExecutionRequested{
      cluster_id: cluster_id,
      hosts: hosts,
      checks: checks
    },
    fn multi ->
      # Delete old hosts executions states
      multi =
        Ecto.Multi.delete_all(
          multi,
          :delete_old_hosts_executions,
          from(c in CheckResultReadModel, where: c.cluster_id == ^cluster_id)
        )

      # Delete old results
      multi =
        Ecto.Multi.delete_all(
          multi,
          :delete_old_checks_results,
          from(h in HostChecksResultsReadModel, where: h.cluster_id == ^cluster_id)
        )

      multi =
        hosts
        |> Enum.map(fn host_id ->
          HostChecksResultsReadModel.changeset(
            %HostChecksResultsReadModel{},
            %{
              cluster_id: cluster_id,
              host_id: host_id,
              reachable: true,
              msg: ""
            }
          )
        end)
        |> List.flatten()
        |> Enum.reduce(multi, fn %{changes: %{cluster_id: cluster_id, host_id: host_id}} = changeset,
                                 acc ->
          Ecto.Multi.insert(acc, "#{cluster_id}_#{host_id}", changeset)
        end)

      hosts
      |> Enum.map(fn host_id ->
        Enum.map(checks, fn check_id ->
          CheckResultReadModel.changeset(
            %CheckResultReadModel{},
            %{
              check_id: check_id,
              cluster_id: cluster_id,
              host_id: host_id,
              result: :unknown
            }
          )
        end)
      end)
      |> List.flatten()
      |> Enum.reduce(multi, fn %{changes: %{check_id: check_id, host_id: host_id}} = changeset,
                               acc ->
        Ecto.Multi.insert(acc, "#{host_id}_#{check_id}", changeset)
      end)
    end
  )

  project(
    %HostChecksExecutionCompleted{
      cluster_id: cluster_id,
      host_id: host_id,
      checks_results: checks_results
    },
    fn multi ->
      hosts_executions_changeset =
        %HostChecksResultsReadModel{cluster_id: cluster_id, host_id: host_id}
        |> HostChecksResultsReadModel.changeset(%{reachable: true, msg: ""})

      Ecto.Multi.update(multi, :hosts_executions, hosts_executions_changeset)

      checks_results
      |> Enum.map(fn %{
                       check_id: check_id,
                       result: result
                     } ->
        CheckResultReadModel.changeset(
          %CheckResultReadModel{},
          %{
            cluster_id: cluster_id,
            check_id: check_id,
            host_id: host_id,
            result: result
          }
        )
      end)
      |> Enum.reduce(multi, fn %{changes: %{check_id: check_id}} = changeset, acc ->
        Ecto.Multi.insert(acc, check_id, changeset,
          on_conflict: :replace_all,
          conflict_target: [:cluster_id, :host_id, :check_id]
        )
      end)
    end
  )

  project(
    %HostChecksExecutionUnreachable{
      cluster_id: cluster_id,
      host_id: host_id,
      msg: msg
    },
    fn multi ->
      hosts_executions_changeset =
        %HostChecksResultsReadModel{cluster_id: cluster_id, host_id: host_id}
        |> HostChecksResultsReadModel.changeset(%{reachable: false, msg: msg})

      Ecto.Multi.update(multi, :hosts_executions, hosts_executions_changeset)
    end
  )

  @impl true
  def after_update(
        %ChecksExecutionRequested{cluster_id: cluster_id, hosts: hosts, checks: checks},
        _,
        _
      ) do
    Enum.each(hosts, fn host_id ->
      TrentoWeb.Endpoint.broadcast("monitoring:clusters", "checks_results_updated", %{
        cluster_id: cluster_id,
        host_id: host_id,
        checks_results:
          Enum.map(checks, fn check_id ->
            %{host_id: host_id, check_id: check_id, result: :unknown}
          end)
      })
    end)
  end

  @impl true
  def after_update(
        %HostChecksExecutionCompleted{
          cluster_id: cluster_id,
          host_id: host_id,
          checks_results: checks_results
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "checks_results_updated", %{
      cluster_id: cluster_id,
      host_id: host_id,
      checks_results:
        Enum.map(checks_results, fn %{check_id: check_id, result: result} ->
          %{host_id: host_id, check_id: check_id, result: result}
        end)
    })

    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "checks_execution_completed", %{
      cluster_id: cluster_id
    })
  end

  def after_update(_, _, _), do: :ok
end

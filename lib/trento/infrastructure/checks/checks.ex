defmodule Trento.Infrastructure.Checks do
  @moduledoc """
  Checks Engine service integration
  """

  alias Trento.Clusters.Commands.CompleteChecksExecution
  alias Trento.Hosts.Commands.CompleteHostChecksExecution

  alias Trento.Enums.Health
  alias Trento.Infrastructure.Messaging

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  alias Trento.Infrastructure.Checks.{
    ClusterExecutionEnv,
    HostExecutionEnv
  }

  require Logger
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Infrastructure.Checks.TargetType, as: TargetType

  @type target_type :: TargetType.t()
  @type target_env :: HostExecutionEnv.t() | ClusterExecutionEnv.t()
  @type targets :: [%{host_id: String.t()}]

  @supported_targets TargetType.values()

  @spec list_selectable_checks(struct(), target_type()) ::
          {:ok, [String.t()]} | {:error, :unable_to_decode_response | :unable_to_fetch_checks}
  def list_selectable_checks(env, target_type) when target_type in @supported_targets do
    env_query =
      env
      |> Map.from_struct()
      |> Map.put(:target_type, target_type)

    :get
    |> HTTPoison.request(
      "http://localhost:4001/api/v3/checks/catalog",
      "",
      [{"Content-type", "application/json"}],
      params: env_query
    )
    |> decode_response
  end

  def list_selectable_checks(_, _), do: {:error, :target_not_supported}

  @spec request_execution(
          String.t(),
          String.t(),
          target_env,
          targets,
          [String.t()],
          target_type
        ) ::
          :ok | {:error, any}
  def request_execution(execution_id, target_id, env, targets, selected_checks, target_type)
      when target_type in @supported_targets do
    execution_requested = %ExecutionRequested{
      execution_id: execution_id,
      group_id: target_id,
      targets:
        Enum.map(
          targets,
          fn %{host_id: host_id} ->
            %Target{agent_id: host_id, checks: selected_checks}
          end
        ),
      env: build_env(env),
      target_type: TargetType.to_string(target_type)
    }

    case Messaging.publish("executions", execution_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish message to topic executions: #{inspect(reason)}")

        error
    end
  end

  def request_execution(_, _, _, _, _, _), do: {:error, :target_not_supported}

  @spec complete_execution(String.t(), String.t(), Health.t(), target_type) :: :ok | {:error, any}
  def complete_execution(execution_id, target_id, health, :cluster) do
    dispatch_completion_command(
      execution_id,
      CompleteChecksExecution.new!(%{
        cluster_id: target_id,
        health: health
      })
    )
  end

  def complete_execution(execution_id, target_id, health, :host) do
    dispatch_completion_command(
      execution_id,
      CompleteHostChecksExecution.new!(%{
        host_id: target_id,
        health: health
      })
    )
  end

  def complete_execution(_, _, _, _), do: {:error, :target_not_supported}

  defp decode_response({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    case Jason.decode(body, keys: :atoms) do
      {:ok, %{items: checks}} ->
        {:ok, checks}

      _ ->
        {:error, :unable_to_decode_response}
    end
  end

  defp decode_response(_), do: {:error, :unable_to_fetch_checks}

  defp dispatch_completion_command(execution_id, command) do
    commanded().dispatch(command, correlation_id: execution_id)
  end

  defp build_env(%ClusterExecutionEnv{
         cluster_type: :ascs_ers,
         ensa_version: ensa_version,
         provider: provider,
         filesystem_type: filesystem_type
       }) do
    %{
      "cluster_type" => %{kind: {:string_value, Atom.to_string(ClusterType.ascs_ers())}},
      "ensa_version" => %{kind: {:string_value, Atom.to_string(ensa_version)}},
      "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
      "filesystem_type" => %{kind: {:string_value, Atom.to_string(filesystem_type)}}
    }
  end

  defp build_env(%ClusterExecutionEnv{
         cluster_type: cluster_type,
         provider: provider,
         architecture_type: architecture_type
       }) do
    %{
      "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
      "provider" => %{kind: {:string_value, Atom.to_string(provider)}},
      "architecture_type" => %{kind: {:string_value, Atom.to_string(architecture_type)}}
    }
  end

  defp build_env(%HostExecutionEnv{provider: provider}) do
    %{
      "provider" => %{kind: {:string_value, Atom.to_string(provider)}}
    }
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

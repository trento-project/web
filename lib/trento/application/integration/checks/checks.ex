defmodule Trento.Integration.Checks do
  @moduledoc """
  Checks runner service integration
  """

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    StartChecksExecution
  }

  alias Trento.Integration.Checks.{
    CatalogDto,
    ExecutionCompletedEventDto,
    FlatCatalogDto
  }

  @spec request_execution(String.t(), String.t(), [map], [String.t()]) ::
          :ok | {:error, any}
  def request_execution(execution_id, cluster_id, host_settings, selected_checks),
    do: adapter().request_execution(execution_id, cluster_id, host_settings, selected_checks)

  @spec get_catalog ::
          {:ok, FlatCatalogDto.t()} | {:error, any}
  def get_catalog do
    case adapter().get_catalog() do
      {:ok, catalog} ->
        {:ok, catalog}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec get_catalog_grouped_by_provider ::
          {:ok, CatalogDto.t()} | {:error, any}
  def get_catalog_grouped_by_provider do
    case get_catalog() do
      {:ok, content} ->
        group_by_provider_by_group(content.checks)

      {:error, reason} ->
        {:error, reason}
    end
  end

  def handle_callback(%{
        "event" => "execution_started",
        "execution_id" => execution_id,
        "payload" => %{
          "cluster_id" => cluster_id
        }
      }) do
    case StartChecksExecution.new(%{cluster_id: cluster_id}) do
      {:ok, command} ->
        Trento.Commanded.dispatch(command, correlation_id: execution_id)

      error ->
        error
    end
  end

  def handle_callback(%{
        "event" => "execution_completed",
        "execution_id" => execution_id,
        "payload" => payload
      }) do
    with {:ok, execution_completed_event} <- ExecutionCompletedEventDto.new(payload),
         {:ok, command} <-
           build_complete_checks_execution_command(execution_completed_event) do
      Trento.Commanded.dispatch(command, correlation_id: execution_id)
    end
  end

  def handle_callback(_), do: {:error, :invalid_payload}

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp group_by_provider_by_group(flat_catalog) do
    normalized_catalog =
      flat_catalog
      |> Enum.map(&Map.from_struct/1)
      |> Enum.group_by(&Map.take(&1, [:provider]), &Map.drop(&1, [:provider]))
      |> Enum.map(fn {key, value} -> Map.put(key, :groups, group_by_group(value)) end)

    CatalogDto.new(%{providers: normalized_catalog})
  end

  defp group_by_group(groups) do
    groups
    |> Enum.group_by(&Map.take(&1, [:group]), &Map.drop(&1, [:group]))
    |> Enum.map(fn {key, value} -> Map.put(key, :checks, value) end)
  end

  defp build_complete_checks_execution_command(%ExecutionCompletedEventDto{
         cluster_id: cluster_id,
         hosts: hosts
       }) do
    CompleteChecksExecution.new(%{
      cluster_id: cluster_id,
      hosts_executions:
        Enum.map(hosts, fn %{host_id: host_id, reachable: reachable, msg: msg, results: results} ->
          %{
            host_id: host_id,
            reachable: reachable,
            msg: msg, 
            checks_results: Enum.map(results, &Map.from_struct/1)
          }
        end)
    })
  end
end

defmodule Tronto.Monitoring.Discovery do
  @moduledoc """
  Discovery integration context.
  """

  require Logger

  alias Tronto.Repo

  import Ecto.Query

  alias Tronto.Monitoring.Discovery.{
    ClusterPolicy,
    DiscoveryEvent,
    HostPolicy,
    SapSystemPolicy
  }

  @type command :: struct

  @spec handle(map) :: :ok | {:error, any}
  def handle(event) do
    # TODO: Add a cast/validation step here
    # credo:disable-for-next-line
    with {:ok, commands} <- do_handle(event),
         {:ok, _} <- store_discovery_event(event) do
      dispatch(commands)
    else
      # TODO improve error handling, bubbling up validation / command dispatch errors
      {:error, reason} = error ->
        Logger.error("Failed to handle discovery event", error: reason)
        error
    end
  end

  @spec get_current_discovery_events :: [DiscoveryEvent.t()]
  def get_current_discovery_events do
    subquery =
      from d in DiscoveryEvent,
        select: max(d.id),
        group_by: [d.agent_id, d.discovery_type]

    query =
      from d in DiscoveryEvent,
        where: d.id in subquery(subquery)

    Repo.all(query)
  end

  @spec store_discovery_event(map) :: {:ok, DiscoveryEvent.t()} | {:error, any}
  defp store_discovery_event(%{
         "agent_id" => agent_id,
         "discovery_type" => discovery_type,
         "payload" => payload
       }) do
    Repo.insert(%DiscoveryEvent{
      agent_id: agent_id,
      discovery_type: discovery_type,
      payload: payload
    })
  end

  defp do_handle(%{"discovery_type" => "host_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "cloud_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "subscription_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "ha_cluster_discovery"} = event),
    do: ClusterPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "sap_system_discovery"} = event),
    do: SapSystemPolicy.handle(event)

  @spec dispatch(command | [command]) :: :ok | {:error, any}
  defp dispatch(commands) when is_list(commands) do
    Enum.reduce(commands, :ok, fn command, acc ->
      case {Tronto.Commanded.dispatch(command), acc} do
        {:ok, :ok} ->
          :ok

        {{:error, error}, :ok} ->
          {:error, [error]}

        {{:error, error}, {:error, errors}} ->
          {:error, [error | errors]}
      end
    end)
  end

  defp dispatch(command), do: Tronto.Commanded.dispatch(command)
end

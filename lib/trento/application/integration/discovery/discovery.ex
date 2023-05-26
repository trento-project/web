defmodule Trento.Integration.Discovery do
  @moduledoc """
  Discovery integration context.
  """

  require Logger

  alias Trento.Repo

  import Ecto.Query

  alias Trento.Integration.Discovery.{
    ClusterPolicy,
    DiscardedDiscoveryEvent,
    DiscoveryEvent,
    HostPolicy,
    SapSystemPolicy
  }

  alias Trento.Clusters

  @type command :: struct

  @doc """
  Transform a discovery in a list of commands event by using the appropriate policy.
  Store the event in the discovery events log for auditing purposes and dispatch the commands.
  """

  @spec handle(map) :: :ok | {:error, any}
  def handle(event) do
    with {:ok, commands} <- do_handle(event),
         {:ok, _} <- store_discovery_event(event) do
      dispatch(commands)
    else
      {:error, reason} = error ->
        Logger.error("Failed to handle discovery event: #{inspect(reason)}")
        store_discarded_discovery_event(event, inspect(reason))

        error
    end
  end

  @doc """
  Get the discovery events that were handled to build the current state of the system.
  """
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

  @doc """
  Get the discovery events that were dead-lettered.
  """
  @spec get_discarded_discovery_events(number) :: [DiscardedDiscoveryEvent.t()]
  def get_discarded_discovery_events(event_number) do
    query =
      from d in DiscardedDiscoveryEvent,
        order_by: [desc: d.inserted_at],
        limit: ^event_number

    Repo.all(query)
  end

  @doc """
  Prune the discovery events log by removing the events older than the given number of days. 
  """
  @spec prune_events(number) :: non_neg_integer()
  def prune_events(days) do
    end_datetime = Timex.shift(DateTime.utc_now(), days: -days)

    {events_number, nil} =
      DiscoveryEvent
      |> where([d], d.inserted_at <= ^end_datetime)
      |> Repo.delete_all()

    events_number
  end

  @doc """
  Prune the discarded discovery events log by removing the events older than the given number of days. 
  """
  @spec prune_discarded_discovery_events(number) :: non_neg_integer()
  def prune_discarded_discovery_events(days) do
    end_datetime = Timex.shift(DateTime.utc_now(), days: -days)

    {discarded_events_number, nil} =
      DiscardedDiscoveryEvent
      |> where([d], d.inserted_at <= ^end_datetime)
      |> Repo.delete_all()

    discarded_events_number
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

  @spec store_discarded_discovery_event(map, String.t()) ::
          {:ok, DiscardedDiscoveryEvent.t()} | {:error, any}
  defp store_discarded_discovery_event(event_payload, reason) do
    Repo.insert(%DiscardedDiscoveryEvent{
      payload: event_payload,
      reason: reason
    })
  end

  defp do_handle(%{"discovery_type" => "host_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "cloud_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "subscription_discovery"} = event),
    do: HostPolicy.handle(event)

  defp do_handle(%{"discovery_type" => "ha_cluster_discovery", "agent_id" => agent_id} = event) do
    current_cluster_id = Clusters.get_cluster_id_by_host_id(agent_id)

    ClusterPolicy.handle(event, current_cluster_id)
  end

  defp do_handle(%{"discovery_type" => "sap_system_discovery"} = event),
    do: SapSystemPolicy.handle(event)

  defp do_handle(_),
    do: {:error, :unknown_discovery_type}

  @spec dispatch(command | [command]) :: :ok | {:error, any}
  defp dispatch(commands) when is_list(commands) do
    Enum.reduce(commands, :ok, fn command, acc ->
      case {commanded().dispatch(command), acc} do
        {:ok, :ok} ->
          :ok

        {{:error, error}, :ok} ->
          {:error, [error]}

        {{:error, error}, {:error, errors}} ->
          {:error, [error | errors]}
      end
    end)
  end

  defp dispatch(command), do: commanded().dispatch(command)

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

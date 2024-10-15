defmodule Trento.Discovery do
  @moduledoc """
  Discovery integration context.
  """

  require Logger

  alias Trento.Repo

  import Ecto.Query

  alias Trento.Discovery.{
    DiscardedDiscoveryEvent,
    DiscoveryEvent
  }

  alias Trento.Discovery.Policies.{
    ClusterPolicy,
    HostPolicy,
    SapSystemPolicy
  }

  alias Trento.{Clusters, Databases, SapSystems}

  @type command :: struct

  @doc """
  Transform a discovery in a list of commands event by using the appropriate policy.
  Store the event in the discovery events log for auditing purposes and dispatch the commands.
  """

  @spec handle(map) :: :ok | {:error, any}
  def handle(event) do
    with {:ok, commands} <- do_handle(event),
         {:ok, _} <- store_discovery_event(event),
         :ok <- dispatch(commands) do
      :ok
    else
      result -> handle_not_dispatched(event, result)
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

  defp do_handle(%{"discovery_type" => "saptune_discovery", "agent_id" => agent_id} = event) do
    current_application_instances = SapSystems.get_application_instances_by_host_id(agent_id)
    current_database_instances = Databases.get_database_instances_by_host_id(agent_id)
    sap_running = length(current_application_instances) + length(current_database_instances) > 0

    HostPolicy.handle(event, sap_running)
  end

  defp do_handle(%{"discovery_type" => "sap_system_discovery", "agent_id" => agent_id} = event) do
    current_application_instances = SapSystems.get_application_instances_by_host_id(agent_id)
    current_database_instances = Databases.get_database_instances_by_host_id(agent_id)
    cluster_id = Trento.Clusters.get_cluster_id_by_host_id(agent_id)

    SapSystemPolicy.handle(
      event,
      current_application_instances ++ current_database_instances,
      cluster_id
    )
  end

  defp do_handle(_),
    do: {:error, :unknown_discovery_type}

  @spec dispatch(command | [command]) :: :ok | {:error, any} | {:ignore, any}
  defp dispatch(commands) when is_list(commands) do
    Enum.reduce(commands, :ok, fn command, acc ->
      result = commanded().dispatch(command)
      aggregate_dispatch_results(acc, result)
    end)
  end

  defp dispatch(command), do: commanded().dispatch(command)

  defp aggregate_dispatch_results(:ok, :ok), do: :ok
  defp aggregate_dispatch_results(:ok, {:ignore, reason}), do: {:ignore, [reason]}
  defp aggregate_dispatch_results(:ok, {:error, reason}), do: {:error, [reason]}
  defp aggregate_dispatch_results({:ignore, reasons}, :ok), do: {:ignore, reasons}

  defp aggregate_dispatch_results({:ignore, reasons}, {:ignore, reason}),
    do: {:ignore, [reason | reasons]}

  defp aggregate_dispatch_results({:ignore, reasons}, {:error, reason}),
    do: {:error, [reason | reasons]}

  defp aggregate_dispatch_results({:error, reasons}, :ok), do: {:errors, reasons}

  defp aggregate_dispatch_results({:error, reasons}, {:ignore, reason}),
    do: {:error, [reason | reasons]}

  defp aggregate_dispatch_results({:error, reasons}, {:error, reason}),
    do: {:error, [reason | reasons]}

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  defp handle_not_dispatched(event, {:ignore, reasons}) do
    Logger.warning("Ignored discovery event: #{inspect(reasons)}")
    store_discarded_discovery_event(event, inspect(reasons))
    :ok
  end

  defp handle_not_dispatched(event, {:error, reasons} = error) do
    Logger.error("Failed to handle discovery event: #{inspect(reasons)}")
    store_discarded_discovery_event(event, inspect(reasons))
    error
  end
end

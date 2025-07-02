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

  alias Trento.Infrastructure.Discovery.AMQP.Publisher
  alias Trento.Infrastructure.Messaging

  alias Trento.Discoveries.V1.DiscoveryRequested

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
      {:error, reason} = error ->
        Logger.error("Failed to handle discovery event: #{inspect(reason)}")
        store_discarded_discovery_event(event, inspect(reason))

        error
    end
  rescue
    error ->
      IO.inspect(error, label: "Error handling discovery event")
      store_discarded_discovery_event(event, inspect(error))
      {:error, :discovery_exception}
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

  @doc """
  Request saptune discovery in host
  """
  @spec request_saptune_discovery(String.t()) :: :ok | {:error, any}
  def request_saptune_discovery(host_id), do: request_discovery("saptune_discovery", [host_id])

  @doc """
  Request cluster discovery
  """
  @spec request_cluster_discovery(String.t()) :: :ok | {:error, any}
  def request_cluster_discovery(cluster_id) do
    targets =
      cluster_id
      |> Clusters.get_cluster_hosts()
      |> Enum.map(& &1.id)

    request_discovery("ha_cluster_discovery", targets)
  end

  @doc """
  Request cluster hosts discovery
  """
  @spec request_cluster_hosts_discovery(String.t()) :: :ok | {:error, any}
  def request_cluster_hosts_discovery(cluster_id) do
    targets =
      cluster_id
      |> Clusters.get_cluster_hosts()
      |> Enum.map(& &1.id)

    request_discovery("host_discovery", targets)
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
    cluster_sap_instances = Trento.Clusters.get_sap_instances_by_host_id(agent_id)

    SapSystemPolicy.handle(
      event,
      current_application_instances ++ current_database_instances,
      cluster_sap_instances
    )
  end

  defp do_handle(_),
    do: {:error, :unknown_discovery_type}

  @spec dispatch(command | [command]) :: :ok | {:error, any}
  defp dispatch(commands) when is_list(commands) do
    Enum.reduce(commands, :ok, fn command, acc ->
      case {commanded().dispatch(command), acc} do
        {:ok, :ok} ->
          :ok

        {:ok, {:error, errors}} ->
          {:error, errors}

        {{:error, error}, :ok} ->
          {:error, [error]}

        {{:error, error}, {:error, errors}} ->
          {:error, [error | errors]}
      end
    end)
  end

  defp dispatch(command), do: commanded().dispatch(command)

  @spec request_discovery(String.t(), [String.t()]) ::
          :ok | {:error, any}
  defp request_discovery(discovery_type, targets) do
    discovery_requested = %DiscoveryRequested{
      discovery_type: discovery_type,
      targets: targets
    }

    case Messaging.publish(Publisher, "agents", discovery_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish discovery requested message: #{inspect(reason)}")

        error
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

defmodule Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandler do
  @moduledoc """
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "software_updates_discovery_event_handler"

  # alias Trento.Clusters.Commands.RollUpCluster
  # alias Trento.Hosts.Commands.RollUpHost
  # alias Trento.SapSystems.Commands.RollUpSapSystem

  # alias Trento.Clusters.Events.ClusterTombstoned
  # alias Trento.Hosts.Events.HostTombstoned
  # alias Trento.SapSystems.Events.SapSystemTombstoned

  require Logger

  # @max_stream_version Application.compile_env!(:trento, [__MODULE__, :max_stream_version])

  alias Trento.Hosts.Events.{
    HostRegistered,
    HostDetailsUpdated,
    HostRestored,
    HostDeregistered
  }

  @host_events [
    Trento.Hosts.Events.HeartbeatFailed,
    Trento.Hosts.Events.HeartbeatSucceeded,
    Trento.Hosts.Events.HostDetailsUpdated,
    Trento.Hosts.Events.HostRegistered,
    Trento.Hosts.Events.ProviderUpdated,
    Trento.Hosts.Events.SlesSubscriptionsUpdated,
    Trento.Hosts.Events.HostChecksSelected,
    Trento.Hosts.Events.HostChecksHealthChanged,
    Trento.Hosts.Events.HostHealthChanged
  ]

  # def handle(%event_type{host_id: host_id}, %{
  #       stream_version: event_stream_version
  #     })
  #     when event_type in @host_events and event_stream_version > @max_stream_version do
  #   {:ok, %EventStore.Streams.StreamInfo{stream_version: stream_version}} =
  #     Trento.EventStore.stream_info(host_id)

  #   if stream_version > @max_stream_version do
  #     Logger.info(
  #       "Rolling up host: #{host_id} because  #{stream_version} > #{@max_stream_version}"
  #     )

  #     commanded().dispatch(%RollUpHost{host_id: host_id},
  #       consistency: :strong
  #     )
  #   else
  #     :ok
  #   end
  # end

  # def handle(%event_type{cluster_id: cluster_id}, %{
  #       stream_version: event_stream_version
  #     })
  #     when event_type in @cluster_events and event_stream_version > @max_stream_version do
  #   # This is needed to check if an event already triggered a roll-up
  #   {:ok, %EventStore.Streams.StreamInfo{stream_version: stream_version}} =
  #     Trento.EventStore.stream_info(cluster_id)

  #   if stream_version > @max_stream_version do
  #     Logger.info(
  #       "Rolling up cluster: #{cluster_id} because  #{stream_version} > #{@max_stream_version}"
  #     )

  #     commanded().dispatch(%RollUpCluster{cluster_id: cluster_id},
  #       consistency: :strong
  #     )
  #   else
  #     :ok
  #   end
  # end

  # def handle(%event_type{sap_system_id: sap_system_id}, %{
  #       stream_version: event_stream_version
  #     })
  #     when event_type in @sap_system_events and event_stream_version > @max_stream_version do
  #   # This is needed to check if an event already triggered a roll-up
  #   {:ok, %EventStore.Streams.StreamInfo{stream_version: stream_version}} =
  #     Trento.EventStore.stream_info(sap_system_id)

  #   if stream_version > @max_stream_version do
  #     Logger.info(
  #       "Rolling up sap system: #{sap_system_id} because  #{stream_version} > #{@max_stream_version}"
  #     )

  #     commanded().dispatch(%RollUpSapSystem{sap_system_id: sap_system_id},
  #       consistency: :strong
  #     )
  #   else
  #     :ok
  #   end
  # end

  # def handle(%HostTombstoned{host_id: host_id}, _) do
  #   Logger.info("Rolling up host: #{host_id} because HostTombstoned was received")

  #   commanded().dispatch(%RollUpHost{host_id: host_id},
  #     consistency: :strong
  #   )
  # end

  # def handle(%ClusterTombstoned{cluster_id: cluster_id}, _) do
  #   Logger.info("Rolling up cluster: #{cluster_id} because ClusterTombstoned was received")

  #   commanded().dispatch(%RollUpCluster{cluster_id: cluster_id},
  #     consistency: :strong
  #   )
  # end

  # def handle(%SapSystemTombstoned{sap_system_id: sap_system_id}, _) do
  #   Logger.info(
  #     "Rolling up sap system: #{sap_system_id} because SapSystemTombstoned was received"
  #   )

  #   commanded().dispatch(%RollUpSapSystem{sap_system_id: sap_system_id},
  #     consistency: :strong
  #   )
  # end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end

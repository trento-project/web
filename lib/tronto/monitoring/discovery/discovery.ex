defmodule Tronto.Monitoring.Discovery do
  @moduledoc """
  Discovery integration context.
  """

  require Logger

  alias Tronto.Monitoring.Discovery.{
    ClusterPolicy,
    HostPolicy,
    SapSystemPolicy
  }

  @type command :: struct

  @spec handle(map) :: :ok | {:error, any}
  def handle(event) do
    # TODO: Add a cast/validation step here
    # credo:disable-for-next-line
    with {:ok, commands} <- do_handle(event) do
      # TODO: Add the discovery event append log here
      dispatch(commands)
    else
      # TODO improve error handling, bubbling up validation / command dispatch errors
      {:error, reason} = error ->
        Logger.error("Failed to handle discovery event", error: reason)
        error
    end
  end

  def do_handle(%{"discovery_type" => "host_discovery"} = event),
    do: HostPolicy.handle(event)

  def do_handle(%{"discovery_type" => "cloud_discovery"} = event),
    do: HostPolicy.handle(event)

  def do_handle(%{"discovery_type" => "subscription_discovery"} = event),
    do: HostPolicy.handle(event)

  def do_handle(%{"discovery_type" => "ha_cluster_discovery"} = event),
    do: ClusterPolicy.handle(event)

  def do_handle(%{"discovery_type" => "sap_system_discovery"} = event),
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

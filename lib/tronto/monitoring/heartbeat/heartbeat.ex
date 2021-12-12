defmodule Tronto.Monitoring.Heartbeat do
  @moduledoc """
  Heartbeat related functions
  """

  alias Tronto.Monitoring.Heartbeat.Cache, as: HeartbeatCache
  require Logger

  @heartbeat_interval Application.get_env(:tronto, __MODULE__)[:interval]

  @spec heartbeat(any) :: :ok
  def heartbeat(agent_id) do
    HeartbeatCache.put(agent_id, :dub, ttl: @heartbeat_interval)
  end

  def dispatch_heartbeat_failed_commands() do
    HeartbeatCache.all(:expired)
    |> Enum.each(fn agent_id ->
      HeartbeatCache.delete(agent_id)
      dispatch_command(agent_id)
    end)
  end

  defp dispatch_command(agent_id) do
    Logger.info("Heartbeat expired for agents: #{inspect(agent_id)}")
  end
end

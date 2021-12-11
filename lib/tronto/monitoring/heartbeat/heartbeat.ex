defmodule Tronto.Monitoring.Heartbeat do
  @moduledoc """
  Heartbeat related functions
  """

  @heartbeat_time :timer.seconds(5)

  require Logger

  @spec heartbeat(any) :: :ok
  def heartbeat(agent_id) do
    ConCache.put(:heartbeat, agent_id, :dub)
  end

  @spec emit_expired_heartbeat_event({atom, any, any}) :: :ok | :noop
  def emit_expired_heartbeat_event({:delete, _, agent_id}) do
    Logger.info("Emitting heartbeat event: #{agent_id}")
  end

  def emit_expired_heartbeat_event(_), do: :noop

  def con_cache_child_spec() do
    Supervisor.child_spec(
      {
        ConCache,
        [
          name: :heartbeat,
          ttl_check_interval: @heartbeat_time * 2,
          global_ttl: @heartbeat_time * 2,
          callback: &emit_expired_heartbeat_event/1
        ]
      },
      id: {ConCache, :heartbeat_cache}
    )
  end
end

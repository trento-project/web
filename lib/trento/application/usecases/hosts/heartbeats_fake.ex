defmodule Trento.Heartbeats.Faker do
  @moduledoc """
  Heartbeat faker for demo environment
  """
  require Logger

  alias Trento.Hosts

  def send_heartbeats do
    hosts = Hosts.get_all_hosts()

    Enum.each(hosts, fn host ->
      Logger.info("Sending fake heartbeat for host #{host.id}")
      Trento.Heartbeats.heartbeat(host.id)
    end)
  end
end

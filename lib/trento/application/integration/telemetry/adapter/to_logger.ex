defmodule Trento.Integration.Telemetry.ToLogger do
  @behaviour Trento.Integration.Telemetry.Gen

  require Logger

  def publish_hosts_telemetry(hosts_telemetry, installation_id),
    do: Logger.debug(hosts_telemetry: hosts_telemetry, installation_id: installation_id)
end

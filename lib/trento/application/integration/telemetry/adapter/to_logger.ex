defmodule Trento.Integration.Telemetry.ToLogger do
  @moduledoc """
  Telemetry adapter that publishes telemetry data to the logs.
  Used in dev and test environments.
  """

  @behaviour Trento.Integration.Telemetry.Gen

  require Logger

  def publish_hosts_telemetry(hosts_telemetry, installation_id, installation_flavor),
    do:
      Logger.debug(
        hosts_telemetry: hosts_telemetry,
        installation_id: installation_id,
        installation_flavor: installation_flavor
      )
end

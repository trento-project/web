defmodule Trento.Integration.Telemetry.Gen do
  @moduledoc """
  Behaviour of a telemetry adapter.
  """

  alias Trento.HostTelemetryReadModel

  @type installation_id :: String.t()
  @type installation_flavor :: String.t()

  @callback publish_hosts_telemetry(
              [HostTelemetryReadModel.t()],
              installation_id,
              installation_flavor
            ) ::
              :ok | {:error, any}
end

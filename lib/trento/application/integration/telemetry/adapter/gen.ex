defmodule Trento.Integration.Telemetry.Gen do
  alias Trento.HostTelemetryReadModel

  @type installation_id :: String.t()

  @callback publish_hosts_telemetry([HostTelemetryReadModel.t()], installation_id) ::
              :ok | {:error, any}
end

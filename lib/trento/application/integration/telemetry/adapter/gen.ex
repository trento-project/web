defmodule Trento.Integration.Telemetry.Gen do
  @moduledoc """
  Behaviour of a telemetry adapter.
  """

  alias Trento.HostTelemetryReadModel

  @type installation_id :: String.t()

  @callback publish_hosts_telemetry([HostTelemetryReadModel.t()], installation_id) ::
              :ok | {:error, any}
end

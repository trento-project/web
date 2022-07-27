defmodule Trento.Integration.Telemetry do
  @moduledoc """
  Telmetry service integration
  """

  alias Trento.Repo

  alias Trento.HostTelemetryReadModel
  alias Trento.Installation

  require Logger

  @spec publish :: :ok | {:error, any}
  def publish do
    if telemetry_enabled?() do
      publish_hosts_telemetry(Installation.get_installation_id())
    else
      Logger.debug("Telemetry is not enabled... Skipping.")
    end
  end

  @spec publish_hosts_telemetry(String.t()) :: :ok | {:error, any}
  defp publish_hosts_telemetry(installation_id) do
    case Repo.all(HostTelemetryReadModel) do
      [] ->
        Logger.info("No telemetry data found... Skipping.")

      hosts_telemetry ->
        adapter().publish_hosts_telemetry(hosts_telemetry, installation_id)
    end
  end

  @spec telemetry_enabled? :: boolean
  defp telemetry_enabled?,
    do: Installation.eula_accepted?()

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end

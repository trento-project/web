defmodule Trento.Infrastructure.Telemetry do
  @moduledoc """
  Telmetry service integration
  """

  alias Trento.Repo

  alias Trento.Hosts.Projections.HostTelemetryReadModel
  alias Trento.Infrastructure.Installation

  require Logger

  @spec publish :: :ok | {:error, any}
  def publish do
    if telemetry_enabled?() do
      publish_hosts_telemetry(Installation.get_installation_id(), Installation.flavor())
    else
      Logger.debug("Telemetry is not enabled... Skipping.")
    end
  end

  @spec publish_hosts_telemetry(String.t(), String.t()) :: :ok | {:error, any}
  defp publish_hosts_telemetry(installation_id, installation_flavor) do
    case Repo.all(HostTelemetryReadModel) do
      [] ->
        Logger.info("No telemetry data found... Skipping.")

      hosts_telemetry ->
        adapter().publish_hosts_telemetry(hosts_telemetry, installation_id, installation_flavor)
    end
  end

  @spec telemetry_enabled? :: boolean
  defp telemetry_enabled?,
    do: Installation.eula_accepted?()

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end

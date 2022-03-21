defmodule Trento.Integration.Telemetry.Suse do
  @behaviour Trento.Integration.Telemetry.Gen

  @telemetry_url "https://telemetry.trento.suse.com"

  require Logger

  def publish_hosts_telemetry(hosts_telemetry, installation_id) do
    case HTTPoison.post(
           "#{@telemetry_url}/api/collect/hosts",
           build_payload(hosts_telemetry, installation_id),
           [
             {"Content-Type", "application/json"}
           ]
         ) do
      {:ok, %HTTPoison.Response{status_code: 202}} ->
        :ok

      {:ok, %HTTPoison.Response{status_code: status_code, body: body}} ->
        Logger.error(
          "Failed to publish hosts telemetry to SUSE telemetry service. Unexpected status code: #{status_code}",
          body: body
        )

        {:error, :unexpected_status_code}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error(
          "Failed to publish hosts telemetry to SUSE telemetry service. Reason: #{reason}",
          error: reason
        )

        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp build_payload(hosts_telemetry, installation_id) do
    hosts_telemetry
    |> Enum.map(
      &%{
        installation_id: installation_id,
        agent_id: &1.agent_id,
        sles_version: &1.sles_version,
        cpu_count: &1.cpu_count,
        socket_count: &1.socket_count,
        total_memory_mb: &1.total_memory_mb,
        cloud_provider: &1.provider,
        time: &1.updated_at
      }
    )
    |> Jason.encode!()
  end
end

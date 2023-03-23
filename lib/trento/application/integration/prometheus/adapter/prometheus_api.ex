defmodule Trento.Integration.Prometheus.PrometheusApi do
  @moduledoc """
  Prometheus API adapter
  """

  alias Trento.HostReadModel

  alias Trento.Repo

  @behaviour Trento.Integration.Prometheus.Gen

  def get_exporters_status(host_id) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    with %HostReadModel{} <- Repo.get(HostReadModel, host_id),
         {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           HTTPoison.get("#{prometheus_url}/api/v1/query?query=up{agentID='#{host_id}'}"),
         {:ok, %{"data" => %{"result" => results}}} <- Jason.decode(body) do
      {:ok,
       results
       |> Enum.map(&parse_exporter_status/1)
       |> Enum.into(%{})}
    else
      nil ->
        {:error, :host_not_found}

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp parse_exporter_status(%{
         "metric" => %{"exporter_name" => exporter_name},
         "value" => [_, value]
       }) do
    {exporter_name,
     case value do
       "0" ->
         :critical

       "1" ->
         :passing

       _ ->
         :unknown
     end}
  end
end

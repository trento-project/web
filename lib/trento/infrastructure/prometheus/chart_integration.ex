defmodule Trento.Infrastructure.Prometheus.ChartIntegration do
  alias Trento.Charts.ChartTimeSeries.Sample

  @spec query_values_to_samples([map()]) :: {:ok, [Sample.t()]} | {:error, any}
  def query_values_to_samples(query_values) do
    Enum.reduce_while(query_values, {:ok, []}, fn [timestamp, value], {_, acc} ->
      with {:ok, utc_timestamp} <- DateTime.from_unix(trunc(timestamp)),
           {:ok, sample} <- Sample.new(%{timestamp: utc_timestamp, value: value}) do
        {:cont, {:ok, [sample | acc]}}
      else
        {:error, error} -> {:halt, {:error, error}}
      end
    end)
  end
end

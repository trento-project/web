defmodule Trento.Infrastructure.Prometheus.ChartIntegration do
  alias Trento.Charts.ChartTimeSeries.Sample

  @spec query_values_to_samples([map()]) :: {:ok, [Sample.t()]} | {:error, any}
  def query_values_to_samples(query_values) do
    Enum.reduce_while(query_values, {:ok, []}, fn [timestamp, value], {_, acc} ->
      case Sample.new(%{timestamp: timestamp, value: value}) do
        {:ok, sample} -> {:cont, {:ok, [sample | acc]}}
        {:error, error} -> {:halt, {:error, error}}
      end
    end)
  end
end

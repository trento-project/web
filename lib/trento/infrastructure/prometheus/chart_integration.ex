defmodule Trento.Infrastructure.Prometheus.ChartIntegration do
  @moduledoc """
  ChartIntegration provides a mechanism for mapping prometheus query information to domain
  Chart time series objects
  """
  alias Trento.Infrastructure.Prometheus.PrometheusSamples

  alias Trento.Charts.ChartTimeSeriesSample

  @spec query_values_to_samples([map()]) :: {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}
  def query_values_to_samples(query_values) do
    Enum.reduce_while(query_values, {:ok, []}, fn [timestamp, value], {_, acc} ->
      with {:ok, utc_timestamp} <- DateTime.from_unix(trunc(timestamp)),
           {:ok, %PrometheusSamples{value: float_value, timestamp: sample_timestamp}} <-
             PrometheusSamples.new(%{timestamp: utc_timestamp, value: value}) do
        {:cont,
         {:ok, [%ChartTimeSeriesSample{timestamp: sample_timestamp, value: float_value} | acc]}}
      else
        {:error, error} -> {:halt, {:error, error}}
      end
    end)
  end
end

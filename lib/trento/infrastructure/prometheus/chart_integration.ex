defmodule Trento.Infrastructure.Prometheus.ChartIntegration do
  @moduledoc """
  ChartIntegration provides a mechanism for mapping prometheus query information to domain
  Chart time series objects
  """
  alias Trento.Infrastructure.Prometheus.PrometheusSamples

  alias Trento.Charts.ChartTimeSeriesSample

  @spec matrix_results_to_samples([map()]) :: {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}
  def matrix_results_to_samples(matrix_results) do
    Enum.reduce_while(matrix_results, {:ok, []}, fn [timestamp, value], {_, acc} ->
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

  @spec vector_results_to_samples([map()]) ::
          {:ok, [%{metric: map(), sample: ChartTimeSeriesSample.t()}]} | {:error, any}
  def vector_results_to_samples(vector_results) do
    Enum.reduce_while(vector_results, {:ok, []}, fn %{
                                                      "metric" => metric,
                                                      "value" => [timestamp, value]
                                                    },
                                                    {_, acc} ->
      with {:ok, utc_timestamp} <- DateTime.from_unix(trunc(timestamp)),
           {:ok, %PrometheusSamples{value: float_value, timestamp: sample_timestamp}} <-
             PrometheusSamples.new(%{timestamp: utc_timestamp, value: value}) do
        {:cont,
         {:ok,
          [
            %{
              metric: metric,
              sample: %ChartTimeSeriesSample{timestamp: sample_timestamp, value: float_value}
            }
            | acc
          ]}}
      else
        {:error, error} -> {:halt, {:error, error}}
      end
    end)
  end
end

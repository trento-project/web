defmodule Trento.Infrastructure.Prometheus.ChartIntegration do
  @moduledoc """
  ChartIntegration provides a mechanism for mapping prometheus query information to domain
  Chart time series objects
  """
  alias Trento.Infrastructure.Prometheus.PrometheusSamples

  alias Trento.Charts.ChartTimeSeriesSample

  @spec matrix_results_to_samples([map()]) :: {:ok, [ChartTimeSeriesSample.t()]} | {:error, any}
  def matrix_results_to_samples(query_values) do
    query_values
    |> transformation_pipe()
    |> with_matcher(fn [timestamp, value] -> {timestamp, value} end)
    |> with_sampler(fn
      %PrometheusSamples{value: float_value, timestamp: sample_timestamp}, _raw_result ->
        %ChartTimeSeriesSample{timestamp: sample_timestamp, value: float_value}
    end)
    |> to_samples()
  end

  @spec vector_results_to_samples([map()]) ::
          {:ok, [%{metric: map(), sample: ChartTimeSeriesSample.t()}]} | {:error, any}
  def vector_results_to_samples(vector_results) do
    vector_results
    |> transformation_pipe()
    |> with_matcher(fn %{"value" => [timestamp, value]} -> {timestamp, value} end)
    |> with_sampler(fn %PrometheusSamples{value: float_value, timestamp: sample_timestamp},
                       %{"metric" => metric} ->
      %{
        metric: metric,
        sample: %ChartTimeSeriesSample{timestamp: sample_timestamp, value: float_value}
      }
    end)
    |> to_samples()
  end

  defp transformation_pipe(results) do
    %{
      results: results,
      matcher: nil,
      sampler: nil
    }
  end

  defp with_matcher(pipe, matcher) do
    %{
      pipe
      | matcher: matcher
    }
  end

  defp with_sampler(pipe, sampler) do
    %{
      pipe
      | sampler: sampler
    }
  end

  defp to_samples(%{results: vector_results, matcher: matcher, sampler: sampler}) do
    Enum.reduce_while(vector_results, {:ok, []}, fn result, {_, acc} ->
      {timestamp, value} = matcher.(result)

      with {:ok, utc_timestamp} <- DateTime.from_unix(trunc(timestamp)),
           {:ok, prom_sample} <- PrometheusSamples.new(%{timestamp: utc_timestamp, value: value}) do
        {:cont, {:ok, [sampler.(prom_sample, result) | acc]}}
      else
        {:error, error} -> {:halt, {:error, error}}
      end
    end)
  end
end

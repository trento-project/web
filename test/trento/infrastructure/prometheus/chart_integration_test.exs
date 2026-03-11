defmodule Trento.Infrastructure.Prometheus.ChartIntegrationTest do
  use ExUnit.Case

  alias Trento.Charts.ChartTimeSeriesSample
  alias Trento.Infrastructure.Prometheus.ChartIntegration

  describe "time series sampling" do
    test "should return the samples when results are valid" do
      query_values = [
        [1_702_388_298.742, "13.200000000000312"],
        [1_702_388_643.742, "14.083333333333314"],
        [1_702_388_988.742, "12.599999999999719"],
        [1_702_389_333.742, "12.350000000000136"]
      ]

      assert {:ok, samples} = ChartIntegration.matrix_results_to_samples(query_values)

      assertion_samples =
        samples
        |> Enum.reverse()
        |> Enum.with_index()

      for {%ChartTimeSeriesSample{timestamp: timestamp, value: value}, index} <- assertion_samples do
        [query_value_ts, query_value] = Enum.at(query_values, index)

        assert trunc(query_value_ts) == DateTime.to_unix(timestamp)
        assert query_value == Float.to_string(value)
      end
    end

    test "should return the error if one of the results is not a valid value" do
      query_values = [
        [-123, "test"],
        [1_702_388_643.742, "14.083333333333314"],
        [1_702_388_988.742, "12.599999999999719"],
        [1_702_389_333.742, "12.350000000000136"]
      ]

      assert {:error, {:validation, %{value: ["is invalid"]}}} =
               ChartIntegration.matrix_results_to_samples(query_values)
    end
  end

  describe "simple sampling" do
    test "should return the samples when results are valid" do
      results = [
        %{"metric" => %{"foo" => "bar"}, "value" => [1_702_388_298.742, "42"]},
        %{"metric" => %{"bar" => "baz"}, "value" => [1_702_388_643.742, "14.083333333333314"]}
      ]

      assert {:ok, samples} = ChartIntegration.vector_results_to_samples(results)

      assertion_samples =
        samples
        |> Enum.reverse()
        |> Enum.with_index()

      for {
            %{
              metric: metric,
              sample: %ChartTimeSeriesSample{timestamp: timestamp, value: value}
            },
            index
          } <- assertion_samples do
        %{"metric" => result_metric, "value" => [result_value_ts, result_value]} =
          Enum.at(results, index)

        assert result_metric == metric
        assert trunc(result_value_ts) == DateTime.to_unix(timestamp)
        assert result_value |> Float.parse() |> elem(0) == value
      end
    end

    test "should return the error if one of the results is not a valid value" do
      results = [
        %{"metric" => %{"foo" => "bar"}, "value" => [1_702_388_298.742, "42"]},
        %{"metric" => %{"bar" => "baz"}, "value" => [1_702_388_643.742, "14.083333333333314"]},
        %{"metric" => %{"baz" => "qux"}, "value" => [-123, "test"]}
      ]

      assert {:error, {:validation, %{value: ["is invalid"]}}} =
               ChartIntegration.vector_results_to_samples(results)
    end
  end
end

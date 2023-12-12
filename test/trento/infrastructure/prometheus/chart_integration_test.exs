defmodule Trento.Infrastructure.Prometheus.ChartIntegrationTest do
  use ExUnit.Case

  alias Trento.Infrastructure.Prometheus.ChartIntegration
  alias Trento.Charts.ChartTimeSeries.Sample

  test "should return the samples when the query values are valid" do
    query_values = [
      [1_702_388_298.742, "13.200000000000312"],
      [1_702_388_643.742, "14.083333333333314"],
      [1_702_388_988.742, "12.599999999999719"],
      [1_702_389_333.742, "12.350000000000136"]
    ]

    assert {:ok, samples} = ChartIntegration.query_values_to_samples(query_values)

    assertion_samples =
      samples
      |> Enum.reverse()
      |> Enum.with_index()

    for {%Sample{timestamp: timestamp, value: value}, index} <- assertion_samples do
      [query_value_ts, query_value] = Enum.at(query_values, index)

      assert trunc(query_value_ts) == DateTime.to_unix(timestamp)
      assert query_value == Decimal.to_string(value)
    end
  end

  test "should return the error if one of the values is not a valid value" do
    query_values = [
      [-123, "test"],
      [1_702_388_643.742, "14.083333333333314"],
      [1_702_388_988.742, "12.599999999999719"],
      [1_702_389_333.742, "12.350000000000136"]
    ]

    assert {:error, {:validation, %{value: ["is invalid"]}}} =
             ChartIntegration.query_values_to_samples(query_values)
  end
end

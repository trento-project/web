defmodule Trento.Infrastructure.Prometheus.PrometheusApiTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Infrastructure.Prometheus.PrometheusApi

  test "should return not found is the host is not registered" do
    assert {:error, :not_found} == PrometheusApi.get_exporters_status(Faker.UUID.v4())
  end
end

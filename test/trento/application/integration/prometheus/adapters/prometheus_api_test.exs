defmodule Trento.Integration.Prometheus.PrometheusApiTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.Integration.Prometheus.PrometheusApi

  test "should return host not found is the host is not registered" do
    assert {:error, :host_not_found} == PrometheusApi.get_exporters_status(Faker.UUID.v4())
  end
end

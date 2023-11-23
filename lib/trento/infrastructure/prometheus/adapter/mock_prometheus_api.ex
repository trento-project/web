defmodule Trento.Infrastructure.Prometheus.MockPrometheusApi do
  @moduledoc """
  Mocks prometheus API calls
  """

  @behaviour Trento.Infrastructure.Prometheus.Gen

  def get_exporters_status(_), do: {:ok, %{"Node Exporter" => :passing}}
end

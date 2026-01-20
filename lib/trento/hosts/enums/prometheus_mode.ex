defmodule Trento.Hosts.Enums.PrometheusMode do
  @moduledoc """
  Type that represents the Prometheus mode for a host.

  - :pull - SLES 15 hosts using node_exporter (Prometheus pulls metrics)
  - :push - SLES 16 hosts using Alloy (host pushes metrics)
  """

  use Trento.Support.Enum, values: [:push, :pull]
end

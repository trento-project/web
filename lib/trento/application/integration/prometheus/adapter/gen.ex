defmodule Trento.Integration.Prometheus.Gen do
  @moduledoc """
  Behaviour of a prometheus adapter.
  """

  @callback get_exporters_status(host_id :: String.t()) ::
              {:ok, map} | {:error, any}
end

defmodule Trento.Infrastructure.Prometheus.Gen do
  @moduledoc """
  Behaviour of a prometheus adapter.
  """

  @callback get_exporters_status(host_id :: String.t()) ::
              {:ok, map} | {:error, any}

  @callback query(query :: String.t(), time :: DateTime.t()) ::
              {:ok, map} | {:error, any}

  @callback query_range(query :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
              {:ok, map} | {:error, any}
end

defmodule Trento.Infrastructure.Prometheus.Adapter.HttpClient do
  @moduledoc """
  HTTP client behaviour for Prometheus API calls.
  """

  @callback get(url :: String.t(), headers :: HTTPoison.Request.headers(), options :: keyword()) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour __MODULE__

  @impl true
  def get(url, headers \\ [], options \\ []), do: HTTPoison.get(url, headers, options)
end

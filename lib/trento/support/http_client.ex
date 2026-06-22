# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.HttpClient do
  @moduledoc """
  Shared HTTP client behaviour wrapping `HTTPoison`. The default implementation
  forwards to HTTPoison and injects secure SSL defaults (`verify_peer` with the
  system CA bundle); callers can override individual SSL keys by passing their
  own `:ssl` keyword. Tests substitute a Mox mock via config.
  """

  require Logger

  @callback get(url :: String.t(), headers :: list(), options :: keyword()) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback request(
              verb :: atom(),
              url :: String.t(),
              body :: binary(),
              headers :: list(),
              options :: keyword()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour __MODULE__

  @impl true
  def get(url, headers \\ [], options \\ []),
    do: HTTPoison.get(url, headers, inject_ssl(options))

  @impl true
  def request(verb, url, body, headers, options),
    do: HTTPoison.request(verb, url, body, headers, inject_ssl(options))

  defp inject_ssl(options) do
    default_ssl = [verify: :verify_peer, cacerts: :public_key.cacerts_get()]
    Keyword.update(options, :ssl, default_ssl, &Keyword.merge(default_ssl, &1))
  end
end

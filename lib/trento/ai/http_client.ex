# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.HttpClient do
  @moduledoc """
  Thin HTTP client behaviour used by the remote AI tool stack
  (`Trento.AI.RemoteOpenApiToolSource` for spec fetches,
  `Trento.AI.RemoteHttpTool` for tool dispatch).

  The default implementation wraps `HTTPoison`; tests swap in a Mox
  mock via `config :trento, :ai, http_client: ...`. Keeping the surface
  to two callbacks (a verb-typed `request/5` plus a sugar `get/3`)
  matches the calling sites and avoids leaking the full HTTPoison API
  through the seam.
  """

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
  def get(url, headers \\ [], options \\ []), do: HTTPoison.get(url, headers, options)

  @impl true
  def request(verb, url, body, headers, options),
    do: HTTPoison.request(verb, url, body, headers, options)

  @doc """
  Returns the configured implementation, falling back to this module.
  """
  @spec impl() :: module()
  def impl do
    :trento
    |> Application.get_env(:ai, [])
    |> Keyword.get(:http_client, __MODULE__)
  end
end

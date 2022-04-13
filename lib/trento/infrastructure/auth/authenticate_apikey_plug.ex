defmodule Trento.Infrastructure.Auth.AuthenticateAPIKeyPlug do
  @moduledoc """
  A Plug that authenticates API calls via an API Key provided in `X-Trento-apiKey` HTTP header
  """
  import Plug.Conn
  require Logger

  def init(opts) do
    Keyword.get(opts, :error_handler) ||
      raise "No :error_handler configuration option provided. It's required to set this when using #{inspect(__MODULE__)}."
  end

  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, handler) do
    with [api_key] <- get_req_header(conn, "x-trento-apikey"),
         {:ok, _data} <- Trento.Application.Auth.ApiKey.verify(api_key) do
      assign(conn, :api_key_authenticated, true)
    else
      error ->
        Logger.debug("Unable to authenticate apikey", error: error)

        conn
        |> handler.call(:not_authenticated)
        |> halt()
    end
  end
end

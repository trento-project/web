defmodule TrentoWeb.Plugs.AuthenticateAPIKeyPlug do
  @moduledoc """
  A Plug that authenticates API calls via an API Key provided in `X-Trento-apiKey` HTTP header
  """
  import Plug.Conn
  require Logger

  alias Trento.Settings
  alias Trento.Settings.ApiKeySettings
  alias TrentoWeb.Auth.ApiKey

  def init(opts) do
    Keyword.get(opts, :error_handler) ||
      raise "No :error_handler configuration option provided. It's required to set this when using #{inspect(__MODULE__)}."
  end

  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, handler) do
    with {:ok, api_key} <- read_api_key(conn),
         {:ok, claims} <- validate_api_key(api_key),
         {:ok, _claims} <- validate_jti(claims) do
      assign(conn, :api_key_authenticated, true)
    else
      {:error, reason} ->
        Logger.error("Unable to authenticate apikey: #{inspect(reason)}")

        conn
        |> handler.call(:not_authenticated)
        |> halt()
    end
  end

  defp read_api_key(conn) do
    case get_req_header(conn, "x-trento-apikey") do
      [api_key | _rest] -> {:ok, api_key}
      _ -> {:error, "No api key found in headers"}
    end
  end

  defp validate_api_key(api_key), do: ApiKey.verify_and_validate(api_key)

  defp validate_jti(%{"jti" => token_identifier} = claims) do
    with {:ok, %ApiKeySettings{jti: jti}} <- Settings.get_api_key_settings() do
      if jti == token_identifier do
        {:ok, claims}
      else
        {:error, :token_jti_not_valid}
      end
    end
  end
end

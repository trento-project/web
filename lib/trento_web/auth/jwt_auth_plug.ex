defmodule TrentoWeb.Auth.JWTAuthPlug do
  @moduledoc """
    The JWTAuthPlug is a Pow compatibile authorization flow.
    Handles the login and the credentials recovery at each request

    Uses Joken for jwt management

    See the pow documentation for further details.
  """
  use Pow.Plug.Base

  require Logger

  alias Plug.Conn
  alias TrentoWeb.Auth.AccessToken, as: AccessToken

  @impl true
  @spec fetch(Plug.Conn.t(), any) :: {Plug.Conn.t(), nil | %{optional(<<_::40>>) => binary}}
  def fetch(conn, _config) do
    with {:ok, jwt_token} <- read_token(conn),
         {:ok, claims} <- validate_access_token(jwt_token) do
      conn =
        conn
        |> Conn.put_private(:api_access_token, jwt_token)
        |> Conn.put_private(:user_id, claims["user_id"])

      {conn, %{"access_token" => jwt_token, "user_id" => claims["user_id"]}}
    else
      _any -> {conn, nil}
    end
  end

  @impl true
  def create(conn, user, _config) do
    claims = %{"user_id" => user.id}
    generated_token = AccessToken.generate_and_sign!(claims)

    conn =
      conn
      |> Conn.put_private(:api_access_token, generated_token)
      |> Conn.put_private(:access_token_expiration, AccessToken.expires_in())

    {conn, user}
  end

  @impl true
  def delete(conn, _config) do
    conn
  end

  @spec read_token(Conn.t()) :: {atom(), any()}
  defp read_token(conn) do
    case Conn.get_req_header(conn, "authorization") do
      [token | _rest] -> {:ok, token |> String.replace("Bearer", "") |> String.trim()}
      _any -> {:error, "No Auth token found"}
    end
  end

  @spec validate_access_token(binary()) :: {atom(), any()}
  defp validate_access_token(jwt_token),
    do: AccessToken.verify_and_validate(jwt_token)
end

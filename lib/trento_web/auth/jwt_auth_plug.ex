defmodule TrentoWeb.Auth.JWTAuthPlug do
  @moduledoc """
    The JWTAuthPlug is a Pow compatible authorization flow.
    Handles the login and the credentials recovery at each request

    Uses Joken for jwt management

    See the pow documentation for further details.
    https://hexdocs.pm/pow/Pow.Plug.Base.html
  """
  use Pow.Plug.Base

  require Logger

  alias Plug.Conn
  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.Auth.RefreshToken

  @impl true
  @doc """
    Read, validate and decode the JWT from authorization header at each call
  """
  def fetch(conn, _config) do
    with {:ok, jwt_token} <- read_token(conn),
         {:ok, claims} <- validate_access_token(jwt_token) do
      conn =
        conn
        |> Conn.put_private(:api_access_token, jwt_token)
        |> Conn.put_private(:user_id, claims["sub"])

      {conn, %{"access_token" => jwt_token, "user_id" => claims["sub"]}}
    else
      _ -> {conn, nil}
    end
  end

  @impl true
  @doc """
    Generates the refresh and access token pairs from a User
    The generated credentials will be stored in private section of the Plug.Conn struct
  """
  def create(conn, user, _config) do
    claims = %{"sub" => user.id}
    access_token = AccessToken.generate_access_token!(claims)
    refresh_token = RefreshToken.generate_refresh_token!(claims)

    conn =
      conn
      |> Conn.put_private(:api_access_token, access_token)
      |> Conn.put_private(:api_refresh_token, refresh_token)
      |> Conn.put_private(:access_token_expiration, AccessToken.expires_in())

    {conn, user}
  end

  @doc """
  Creates new tokens using the refresh token.

  The refresh token should be verified and valid, a new access token will be issued
  with the same validity as other access tokens, for the sub of the refresh token.
  """
  @spec renew(Conn.t(), String.t()) :: {:ok, Conn.t()} | {:error, any}
  def renew(conn, refresh_token) do
    case validate_refresh_token(refresh_token) do
      {:ok, claims} ->
        new_access_token = AccessToken.generate_access_token!(%{"sub" => claims["sub"]})

        conn =
          conn
          |> Conn.put_private(:api_access_token, new_access_token)
          |> Conn.put_private(:access_token_expiration, AccessToken.expires_in())

        {:ok, conn}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  @doc """
    The authentication method is stateles, this is a no-op. Need that to satisfy Pow library
  """
  def delete(conn, _config) do
    conn
  end

  defp read_token(conn) do
    case Conn.get_req_header(conn, "authorization") do
      [token | _rest] -> {:ok, token |> String.replace("Bearer", "") |> String.trim()}
      _ -> {:error, "No Auth token found"}
    end
  end

  @spec validate_access_token(binary()) :: {atom(), any()}
  defp validate_access_token(jwt_token),
    do: AccessToken.verify_and_validate(jwt_token)

  @spec validate_refresh_token(binary()) :: {atom(), any()}
  defp validate_refresh_token(jwt_token),
    do: RefreshToken.verify_and_validate(jwt_token)
end

defmodule TrentoWeb.Plugs.AppJWTAuthPlug do
  @moduledoc """
    The AppJWTAuthPlug is a Pow compatible authorization flow.
    Handles the login and the credentials recovery at each request

    Uses Joken for jwt management

    See the pow documentation for further details.
    https://hexdocs.pm/pow/Pow.Plug.Base.html
  """
  use Pow.Plug.Base

  require Logger

  alias Plug.Conn
  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.Auth.RefreshToken

  @impl true
  @doc """
    Read, validate and decode the JWT from authorization header at each call
  """
  def fetch(conn, _config) do
    with {:ok, jwt_token} <- read_token(conn),
         {:ok, claims} <- validate_access_token(jwt_token) do
      sub = claims["sub"]
      abilities = claims["abilities"]

      conn =
        conn
        |> Conn.put_private(:api_access_token, jwt_token)
        |> Conn.put_private(:user_id, sub)
        |> Conn.put_private(:abilities, abilities)

      {conn,
       %{
         "access_token" => jwt_token,
         "user_id" => sub,
         "abilities" => abilities
       }}
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
    {:ok, user} = Users.get_user(user.id)

    claims = %{
      "sub" => user.id,
      "abilities" => Enum.map(user.abilities, &%{name: &1.name, resource: &1.resource})
    }

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

  Deleted and locked users, are not allowed to generate a refresh token.
  """
  @spec renew(Conn.t(), String.t()) :: {:ok, Conn.t()} | {:error, any}
  def renew(conn, refresh_token) do
    with {:ok, %{"sub" => user_id}} <- validate_refresh_token(refresh_token),
         {:ok, user} <- Users.get_user(user_id),
         {:ok, conn} <- attach_refresh_token_to_conn(conn, user) do
      {:ok, conn}
    else
      {:error, reason} ->
        Logger.error("Could not refresh the access token: #{inspect(reason)}")

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

  defp attach_refresh_token_to_conn(conn, user) do
    if user_allowed_to_renew?(user) do
      new_access_token = AccessToken.generate_access_token!(%{"sub" => user.id})

      conn =
        conn
        |> Conn.put_private(:api_access_token, new_access_token)
        |> Conn.put_private(:access_token_expiration, AccessToken.expires_in())

      {:ok, conn}
    else
      {:error, :user_not_allowed_to_renew}
    end
  end

  defp user_allowed_to_renew?(%User{deleted_at: deleted_at, locked_at: locked_at})
       when not is_nil(deleted_at) or not is_nil(locked_at),
       do: false

  defp user_allowed_to_renew?(%User{}), do: true
end

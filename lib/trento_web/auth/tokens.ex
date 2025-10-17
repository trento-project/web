defmodule TrentoWeb.Auth.Tokens do
  @moduledoc """
  Module responsible to deal with tokens concerns like introspection and validation.
  """

  alias TrentoWeb.Auth.{AccessToken, RefreshToken}
  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT

  alias Trento.PersonalAccessTokens
  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users

  alias Trento.Support.StructHelper

  @access_token_audience AccessToken.aud()
  @pat_audience PAT.aud()
  @pat_prefix PAT.prefix()

  defdelegate generate_access_token!(claims), to: AccessToken
  defdelegate access_token_expires_in(), to: AccessToken, as: :expires_in
  defdelegate generate_refresh_token!(claims), to: RefreshToken
  defdelegate verify_and_validate_refresh_token(token), to: RefreshToken, as: :verify_and_validate

  @doc """
  Verifies and validates a given token (might or might not be a JWT).

  ## Parameters
    - token: The token to be verified. It can be a JWT access token or a Personal Access Token (PAT).

  ## Returns
    - {:ok, claims} if the token is valid.
    - {:error, reason} if the token is invalid, expired, revoked or, in case of PATs, belongs to a deleted/disabled user.
  """
  @spec verify_and_validate(binary()) :: {:ok, map()} | {:error, atom()}
  def verify_and_validate(token), do: apply_callback(token, &validate_token/2)

  @doc """
  Introspects and validates a given JWT token.

  ## Parameters
    - token: The JWT token to be introspected.

  ## Returns
    - claims: always a map of claims. If the token is invalid, the map contains only the "active" claim set to false.
  """
  @spec introspect(binary()) :: map()
  def introspect(jwt_token) do
    jwt_token
    |> apply_callback(&introspect_token/2)
    |> case do
      {:ok, claims} -> Map.put(claims, "active", true)
      {:error, _} -> %{"active" => false}
    end
    |> Map.drop(["typ"])
  end

  defp apply_callback(@pat_prefix <> _ = token, callback), do: callback.(token, @pat_audience)

  defp apply_callback(token, callback) do
    case Joken.peek_claims(token) do
      {:ok, %{"jti" => _jti, "sub" => _user_id, "aud" => audience}} ->
        callback.(token, audience)

      {:error, _} = error ->
        error

      _ ->
        {:error, :invalid_token}
    end
  end

  defp validate_token(token, @access_token_audience),
    do: AccessToken.verify_and_validate(token)

  defp validate_token(token, @pat_audience) do
    case PersonalAccessTokens.validate(token) do
      {:ok, %PersonalAccessToken{user_id: user_id}} ->
        {:ok, %{"sub" => user_id}}

      {:error, _} = error ->
        error
    end
  end

  defp validate_token(_, _), do: {:error, :invalid_audience}

  defp introspect_token(jwt_token, @access_token_audience) do
    with {:ok, %{"sub" => user_id} = claims} <- AccessToken.verify_and_validate(jwt_token),
         {:ok, %{abilities: abilities}} <- Users.get_user(user_id) do
      enrich_claims(claims, abilities)
    end
  end

  defp introspect_token(token, @pat_audience) do
    with {:ok, %{user_id: user_id, user: %{abilities: abilities}}} <-
           PersonalAccessTokens.validate_and_introspect(token) do
      enrich_claims(%{"sub" => user_id}, abilities)
    end
  end

  defp introspect_token(_, _), do: {:error, :invalid_audience}

  defp enrich_claims(claims, abilities) do
    {:ok,
     abilities
     |> Enum.map(
       &(&1
         |> StructHelper.to_map()
         |> Map.take(["name", "resource"]))
     )
     |> then(&Map.put(claims, "abilities", &1))}
  end
end

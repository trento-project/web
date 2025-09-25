defmodule TrentoWeb.Auth.Tokens do
  @moduledoc """
  Module responsible to deal with tokens concerns like introspection and validation.
  """

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT

  alias Trento.PersonalAccessTokens
  alias Trento.Users

  alias Trento.Support.StructHelper

  @access_token_audience AccessToken.aud()
  @pat_audience PAT.aud()

  @doc """
  Verifies and validates a given JWT token.

  ## Parameters
    - token: The JWT token to be verified.

  ## Returns
    - {:ok, claims} if the token is valid.
    - {:error, reason} if the token is invalid, expired, revoked or, in case of PATs, belongs to a deleted/disabled user.
  """
  @spec verify_and_validate(binary()) :: {:ok, map()} | {:error, atom()}
  def verify_and_validate(jwt_token), do: validate_token(jwt_token)

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
    |> introspect_token()
    |> case do
      {:ok, claims} -> Map.put(claims, "active", true)
      {:error, _} -> %{"active" => false}
    end
    |> Map.drop(["typ"])
  end

  defp validate_token(jwt_token), do: apply_callback(jwt_token, &validate_token/2)

  defp introspect_token(jwt_token), do: apply_callback(jwt_token, &introspect_token/2)

  defp apply_callback(jwt_token, callback) do
    case Joken.peek_claims(jwt_token) do
      {:ok, %{"jti" => _jti, "sub" => _user_id, "aud" => audience}} ->
        callback.(jwt_token, audience)

      {:error, _} = error ->
        error

      _ ->
        {:error, :invalid_token}
    end
  end

  defp validate_token(jwt_token, @access_token_audience),
    do: AccessToken.verify_and_validate(jwt_token)

  defp validate_token(jwt_token, @pat_audience) do
    case PAT.verify_and_validate(jwt_token) do
      {:ok, %{"jti" => jti, "sub" => user_id} = claims} ->
        jti
        |> PersonalAccessTokens.valid?(user_id)
        |> handle_pat_validation(claims)

      {:error, _} = error ->
        error
    end
  end

  defp validate_token(_, _), do: {:error, :invalid_audience}

  defp handle_pat_validation(false, _), do: {:error, :invalid_pat}
  defp handle_pat_validation(true, claims), do: {:ok, claims}

  defp introspect_token(jwt_token, @access_token_audience) do
    with {:ok, %{"sub" => user_id} = claims} <- AccessToken.verify_and_validate(jwt_token),
         {:ok, %{abilities: abilities}} <- Users.get_user(user_id) do
      enrich_claims(claims, abilities)
    end
  end

  defp introspect_token(jwt_token, @pat_audience) do
    with {:ok, %{"jti" => jti, "sub" => user_id} = claims} <- PAT.verify_and_validate(jwt_token),
         {:ok, %{user: %{abilities: abilities}}} <-
           PersonalAccessTokens.validate_and_introspect(jti, user_id) do
      enrich_claims(claims, abilities)
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

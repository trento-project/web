defmodule TrentoWeb.Auth.AssentSamlStrategy do
  @moduledoc """
  Assent strategy to handle SAML authentication
  """

  @behaviour Assent.Strategy
  use TrentoWeb, :verified_routes

  @spec authorize_url(Keyword.t()) :: {:ok, %{url: binary()}} | {:error, term()}
  def authorize_url(_config) do
    idp_id = Application.fetch_env!(:trento, :saml)[:idp_id]
    {:ok, %{url: ~p"/sso/auth/signin/#{idp_id}"}}
  end

  @spec callback(Keyword.t(), map()) :: {:ok, %{user: map(), token: map()}} | {:error, term()}
  def callback(_config, nil) do
    {:error, :user_not_authenticated}
  end

  def callback(_config, %{attributes: attributes}) do
    case normalize(attributes) do
      {:ok, user} ->
        {:ok, %{user: user, token: %{}}}

      error ->
        error
    end
  end

  defp normalize(%{
         "username" => username,
         "email" => email,
         "firstName" => first_name,
         "lastName" => last_name
       }) do
    {:ok,
     %{
       "sub" => username,
       "email" => email,
       "username" => username,
       "email_verified" => true,
       "name" => first_name,
       "family_name" => last_name
     }}
  end

  defp normalize(%{}) do
    {:error, :user_attributes_missing}
  end
end

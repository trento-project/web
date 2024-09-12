defmodule TrentoWeb.Auth.AssentSamlStrategy do
  @behaviour Assent.Strategy
  use TrentoWeb, :verified_routes

  @spec authorize_url(Keyword.t()) :: {:ok, %{url: binary()}} | {:error, term()}
  def authorize_url(config) do
    idp_id = Application.fetch_env!(:trento, :saml)[:idp_id]
    {:ok, %{url: ~p"/sso/auth/signin/#{idp_id}"}}
  end

  @spec callback(Keyword.t(), map()) :: {:ok, %{user: map(), token: map()}} | {:error, term()}
  def callback(config, %{attributes: attributes}) do
    {:ok, %{user: normalize(config, attributes), token: %{}}}
  end

  def normalize(_config, saml_attributes) do
    %{
      "sub" => saml_attributes["username"],
      "email" => saml_attributes["email"],
      "username" => saml_attributes["username"],
      "email_verified" => true,
      "given_name" => saml_attributes["firstName"],
      "family_name" => saml_attributes["lastName"]
    }
  end
end

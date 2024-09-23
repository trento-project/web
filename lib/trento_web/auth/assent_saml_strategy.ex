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
    %{
      username_field: username_field,
      email_field: email_field,
      first_name_field: first_name_field,
      last_name_field: last_name_field
    } = user_profile_attributes()

    expected_attributes =
      Map.new(attributes, fn
        {^username_field, username} -> {:username, username}
        {^email_field, email} -> {:email, email}
        {^first_name_field, first_name} -> {:first_name, first_name}
        {^last_name_field, last_name} -> {:last_name, last_name}
        other -> other
      end)

    case normalize(expected_attributes) do
      {:ok, user} ->
        {:ok, %{user: user, token: %{}}}

      error ->
        error
    end
  end

  defp normalize(%{
         username: username,
         email: email,
         first_name: first_name,
         last_name: last_name
       }) do
    {:ok,
     %{
       "sub" => username,
       "email" => email,
       "username" => username,
       "email_verified" => true,
       "name" => "#{first_name} #{last_name}"
     }}
  end

  defp normalize(%{}) do
    {:error, :user_attributes_missing}
  end

  defp user_profile_attributes,
    do: Application.fetch_env!(:trento, :saml)[:user_profile_attributes]
end

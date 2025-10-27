defmodule TrentoWeb.SessionController do
  alias Plug.Conn
  alias PowAssent.Plug, as: PowAssentPlug
  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.OpenApi.V1.Schema.Auth.{
    Credentials,
    ExternalIdpCallback,
    IntrospectedToken,
    IntrospectTokenRequest,
    LoginCredentials,
    RefreshedCredentials,
    RefreshTokenRequest,
    UserIDPCredentials
  }

  alias TrentoWeb.Auth.Tokens

  alias TrentoWeb.Plugs.AppJWTAuthPlug

  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback TrentoWeb.FallbackController

  plug TrentoWeb.Plugs.ExternalIdpGuardPlug when action in [:create]

  require Logger

  operation :create,
    summary: "Platform login.",
    tags: ["Auth"],
    description:
      "Retrieve the access and refresh token for api interactions, returns two jwt tokens.",
    security: [],
    request_body:
      {"Login request containing user credentials for authentication and token issuance.",
       "application/json", LoginCredentials},
    responses: [
      ok:
        {"Authentication result with access and refresh tokens for secure API usage.",
         "application/json", Credentials},
      unauthorized: Schema.Unauthorized.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create(conn, credentials) do
    case authenticate_trento_user(conn, credentials) do
      {:ok, conn} ->
        render(conn, :logged,
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration],
          refresh_token: conn.private[:api_refresh_token]
        )

      {:error, :totp_code_missing} ->
        {:error, :totp_code_missing}

      {:error, _} ->
        {:error, :invalid_credentials}
    end
  end

  operation :refresh,
    summary: "Platform access token refresh.",
    tags: ["Auth"],
    description: "Generate a new access token from a valid refresh token.",
    security: [],
    request_body:
      {"Request containing refresh token for obtaining new access credentials.",
       "application/json", RefreshTokenRequest},
    responses: [
      ok:
        {"Refreshed authentication result with new access token for continued secure API usage.",
         "application/json", RefreshedCredentials}
    ]

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case AppJWTAuthPlug.renew(conn, refresh_token) do
      {:ok, conn} ->
        render(conn, :refreshed,
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration]
        )

      {:error, _} ->
        {:error, :invalid_refresh_token}
    end
  end

  operation :callback,
    summary: "Platform external IDP callback.",
    tags: ["Auth"],
    description: "Authenticate against an external authentication provider.",
    security: [],
    request_body:
      {"Request containing identity provider credentials and authorization code for external authentication.",
       "application/json", ExternalIdpCallback},
    parameters: [
      provider: [
        in: :path,
        description: "Identity provider name.",
        schema: %OpenApiSpex.Schema{type: :string, example: "oauth2_local"},
        required: true
      ]
    ],
    responses: [
      unauthorized: Schema.Unauthorized.response(),
      ok:
        {"Authentication result from external identity provider with access and refresh tokens.",
         "application/json", UserIDPCredentials}
    ]

  def callback(%{body_params: body_params} = conn, %{"provider" => provider}) do
    params = Map.drop(body_params, ["session_params"])
    session_params = Map.get(body_params, "session_params")

    conn
    |> Conn.put_private(:pow_assent_session_params, session_params)
    |> PowAssentPlug.callback_upsert(provider, params, idp_redirect_uri(provider))
    |> case do
      {:ok, conn} ->
        render(conn, "logged.json",
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration],
          refresh_token: conn.private[:api_refresh_token]
        )

      {:error, %{private: %{pow_assent_callback_error: {:user_not_allowed, _}}}} ->
        {:error, :invalid_credentials}

      error ->
        Logger.error("error during sso callback execution: #{inspect(error)}")
        error
    end
  end

  operation :saml_callback,
    summary: "Platform external SAML IDP callback.",
    tags: ["Auth"],
    description:
      "Authenticates the user against an external authentication provider using SAML, enabling single sign-on and federated identity management for secure platform access.",
    security: [],
    parameters: [
      provider: [
        in: :path,
        description:
          "The name of the SAML identity provider to use for authentication. This value should match a configured provider.",
        schema: %OpenApiSpex.Schema{type: :string, example: "saml"}
      ]
    ],
    responses: [
      unauthorized: Schema.Unauthorized.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      ok:
        {"Authentication result using SAML identity provider with access and refresh tokens for platform access.",
         "application/json", UserIDPCredentials}
    ]

  def saml_callback(conn, %{"provider" => saml_provider}) do
    assertion = Samly.get_active_assertion(conn)

    conn
    |> Conn.put_private(:pow_assent_session_params, %{})
    |> PowAssentPlug.callback_upsert(saml_provider, assertion, "")
    |> case do
      {:ok, conn} ->
        render(conn, :logged,
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration],
          refresh_token: conn.private[:api_refresh_token]
        )

      {:error, %{private: %{pow_assent_callback_error: {:user_not_allowed, _}}}} ->
        {:error, :invalid_credentials}

      {:error, %{private: %{pow_assent_callback_error: :user_not_authenticated}}} ->
        {:error, :user_not_authenticated}

      {:error, %{private: %{pow_assent_callback_error: :user_attributes_missing}}} ->
        {:error, :user_attributes_missing}

      error ->
        Logger.error("error during saml callback execution: #{inspect(error)}")
        error
    end
  end

  operation :introspect_token,
    summary: "Introspect a Token",
    description:
      "Introspects a Token (Access Token or Personal Access Token) to verify its validity and retrieve associated metadata.",
    tags: ["Auth"],
    request_body: {"Introspect token request.", "application/json", IntrospectTokenRequest},
    responses: [
      ok: {"Introspected token metadata.", "application/json", IntrospectedToken}
    ]

  def introspect_token(conn, %{"token" => token}) do
    render(conn, :introspected_token, claims: Tokens.introspect(token))
  end

  defp authenticate_trento_user(conn, credentials) do
    with {:ok, %{assigns: %{current_user: logged_user}} = conn} <-
           Pow.Plug.authenticate_user(conn, credentials),
         {:ok, _} <- maybe_validate_totp(logged_user, credentials) do
      {:ok, conn}
    end
  end

  defp maybe_validate_totp(%User{totp_enabled_at: nil} = user, _), do: {:ok, user}

  defp maybe_validate_totp(user, %{"totp_code" => totp_code}),
    do: Users.validate_totp(user, totp_code)

  defp maybe_validate_totp(_, _), do: {:error, :totp_code_missing}

  defp idp_redirect_uri("oidc_local"), do: Application.fetch_env!(:trento, :oidc)[:callback_url]

  defp idp_redirect_uri("oauth2_local"),
    do: Application.fetch_env!(:trento, :oauth2)[:callback_url]

  defp idp_redirect_uri(_), do: ""
end

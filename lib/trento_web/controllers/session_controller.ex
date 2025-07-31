defmodule TrentoWeb.SessionController do
  alias Plug.Conn
  alias PowAssent.Plug, as: PowAssentPlug
  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema
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
      {"User login credentials.", "application/json",
       %OpenApiSpex.Schema{
         description: "User login credentials schema.",
         type: :object,
         additionalProperties: false,
         example: %{
           username: "admin",
           password: "thepassword"
         },
         properties: %{
           username: %OpenApiSpex.Schema{
             type: :string,
             example: "admin"
           },
           password: %OpenApiSpex.Schema{
             type: :string,
             example: "thepassword"
           },
           totp_code: %OpenApiSpex.Schema{
             type: :string,
             example: "123456"
           }
         }
       }},
    responses: [
      ok: {"User credentials.", "application/json",
         %OpenApiSpex.Schema{
           description: "User authentication credentials with tokens.",
           type: :object,
           example: %{
             expires_in: 600,
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A",
             refresh_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             },
             refresh_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             },
             expires_in: %OpenApiSpex.Schema{
               type: :integer,
               example: 600
             }
           }
         }},
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
      {"User login credentials.", "application/json",
       %OpenApiSpex.Schema{
         description: "Refresh token credentials for getting new access token.",
         type: :object,
         example: %{
           refresh_token:
             "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
         },
         properties: %{
           refresh_token: %OpenApiSpex.Schema{
             type: :string,
             example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
           }
         }
       }},
    responses: [
      ok: {"User refreshed credentials.", "application/json",
         %OpenApiSpex.Schema{
           description: "Refreshed authentication credentials with new tokens.",
           type: :object,
           example: %{
             expires_in: 600,
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             },
             expires_in: %OpenApiSpex.Schema{
               type: :integer,
               example: 600
             }
           }
         }}
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
      {"User IDP credentials.", "application/json",
       %OpenApiSpex.Schema{
         description: "User identity provider enrollment credentials with authorization code.",
         type: :object,
         example: %{
           code: "kyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYt",
           session_state: "frHteBttgtW8706m7nqYC6ruYt"
         },
         properties: %{
           code: %OpenApiSpex.Schema{
             type: :string,
             example: "kyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYt"
           },
           session_state: %OpenApiSpex.Schema{
             type: :string,
             example: "frHteBttgtW8706m7nqYC6ruYt"
           }
         },
         required: [:code, :session_state]
       }},
    parameters: [
      provider: [
        in: :path,
        description: "Identity provider name.",
        schema: %OpenApiSpex.Schema{type: :string, example: "oauth2_local"},
        required: true,
      ]
    ],
    responses: [
      unauthorized: Schema.Unauthorized.response(),
      ok: {"User IDP credentials.", "application/json",
         %OpenApiSpex.Schema{
           description: "User identity provider credentials with access tokens.",
           type: :object,
           example: %{
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A",
             refresh_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             },
             refresh_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             }
           }
         }}
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
    description: "Authenticate against an external authentication provider using SAML.",
    security: [],
    parameters: [
      provider: [
        in: :path,
        description: "SAML identity provider name.",
        schema: %OpenApiSpex.Schema{type: :string, example: "saml"}
      ]
    ],
    responses: [
      unauthorized: Schema.Unauthorized.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      ok: {"User IDP credentials.", "application/json",
         %OpenApiSpex.Schema{
           description: "User identity provider credentials with access tokens.",
           type: :object,
           example: %{
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A",
             refresh_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             },
             refresh_token: %OpenApiSpex.Schema{
               type: :string,
               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             }
           }
         }}
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

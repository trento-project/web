defmodule TrentoWeb.SessionController do
  alias Trento.Repo
  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema

  alias TrentoWeb.Plugs.AppJWTAuthPlug

  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback TrentoWeb.FallbackController

  require Logger

  operation :create,
    summary: "Platform login",
    tags: ["Platform"],
    description:
      "Retrieve the access and refresh token for api interactions, returns two jwt tokens",
    security: [],
    request_body:
      {"User login credentials", "application/json",
       %OpenApiSpex.Schema{
         title: "LoginCredentials",
         type: :object,
         additionalProperties: false,
         example: %{
           username: "admin",
           password: "thepassword"
         },
         properties: %{
           username: %OpenApiSpex.Schema{
             type: :string
           },
           password: %OpenApiSpex.Schema{
             type: :string
           },
           totp_code: %OpenApiSpex.Schema{
             type: :string
           }
         }
       }},
    responses: [
      ok:
        {"User credentials", "application/json",
         %OpenApiSpex.Schema{
           title: "Credentials",
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
               type: :string
             },
             refresh_token: %OpenApiSpex.Schema{
               type: :string
             },
             expires_in: %OpenApiSpex.Schema{
               type: :integer
             }
           }
         }},
      unauthorized: Schema.Unauthorized.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create(conn, credentials) do
    case authenticate_trento_user(conn, credentials) do
      {:ok, conn} ->
        render(conn, "logged.json",
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

  operation :show,
    summary: "Current logged user",
    tags: ["Platform"],
    description: "Retrieve information about the logged user",
    responses: [
      ok:
        {"Trento User", "application/json",
         %OpenApiSpex.Schema{
           title: "TrentoUser",
           type: :object,
           example: %{
             username: "admin",
             id: 1
           },
           properties: %{
             username: %OpenApiSpex.Schema{
               type: :string
             },
             id: %OpenApiSpex.Schema{
               type: :integer
             }
           }
         }}
    ]

  def show(conn, _) do
    request_user = Pow.Plug.current_user(conn)
    user = Repo.get_by!(User, id: request_user["user_id"])

    render(conn, "me.json", user: user)
  end

  operation :refresh,
    summary: "Platform access token refresh",
    tags: ["Platform"],
    description: "Generate a new access token from a valid refresh token",
    security: [],
    request_body:
      {"User login credentials", "application/json",
       %OpenApiSpex.Schema{
         title: "Refresh Credentials",
         type: :object,
         example: %{
           refresh_token:
             "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
         },
         properties: %{
           refresh_token: %OpenApiSpex.Schema{
             type: :string
           }
         }
       }},
    responses: [
      ok:
        {"User refreshed credentials", "application/json",
         %OpenApiSpex.Schema{
           title: "RefreshedCredentials",
           type: :object,
           example: %{
             expires_in: 600,
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %OpenApiSpex.Schema{
               type: :string
             },
             expires_in: %OpenApiSpex.Schema{
               type: :integer
             }
           }
         }}
    ]

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case AppJWTAuthPlug.renew(conn, refresh_token) do
      {:ok, conn} ->
        render(conn, "refreshed.json",
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration]
        )

      {:error, _} ->
        {:error, :invalid_refresh_token}
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
end

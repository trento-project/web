defmodule TrentoWeb.SessionController do
  alias OpenApiSpex.Schema

  alias Trento.{
    Repo,
    User
  }

  alias TrentoWeb.Auth.JWTAuthPlug

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
       %Schema{
         title: "LoginCredentials",
         type: :object,
         example: %{
           username: "admin",
           password: "thepassword"
         },
         properties: %{
           username: %Schema{
             type: :string
           },
           password: %Schema{
             type: :string
           }
         }
       }},
    responses: [
      ok:
        {"User credentials", "application/json",
         %Schema{
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
             access_token: %Schema{
               type: :string
             },
             refresh_token: %Schema{
               type: :string
             },
             expires_in: %Schema{
               type: :integer
             }
           }
         }}
    ]

  def create(conn, credentials) do
    case Pow.Plug.authenticate_user(conn, credentials) do
      {:ok, conn} ->
        render(conn, "logged.json",
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration],
          refresh_token: conn.private[:api_refresh_token]
        )

      {:error, _} ->
        {:error, {:invalid_credentials}}
    end
  end

  operation :show,
    summary: "Current logged user",
    tags: ["Platform"],
    description: "Retrieve informations about the logged user",
    responses: [
      ok:
        {"Trento User", "application/json",
         %Schema{
           title: "TrentoUser",
           type: :object,
           example: %{
             username: "admin"
           },
           properties: %{
             username: %Schema{
               type: :string
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
       %Schema{
         title: "Refresh Credentials",
         type: :object,
         example: %{
           refresh_token:
             "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
         },
         properties: %{
           refresh_token: %Schema{
             type: :string
           }
         }
       }},
    responses: [
      ok:
        {"User refreshed credentials", "application/json",
         %Schema{
           title: "RefreshedCredentials",
           type: :object,
           example: %{
             expires_in: 600,
             access_token:
               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
           },
           properties: %{
             access_token: %Schema{
               type: :string
             },
             expires_in: %Schema{
               type: :integer
             }
           }
         }}
    ]

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case JWTAuthPlug.renew(conn, refresh_token) do
      {:ok, conn} ->
        render(conn, "refreshed.json",
          token: conn.private[:api_access_token],
          expiration: conn.private[:access_token_expiration]
        )

      {:error, reason} ->
        Logger.error("Failed to get a new access token for refresh token",
          error: reason
        )

        {:error, {:unauthorized}}
    end
  end
end

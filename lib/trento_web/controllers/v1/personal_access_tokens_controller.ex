defmodule TrentoWeb.V1.PersonalAccessTokensController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users.PersonalAccessToken, as: UserPersonalAccessToken
  alias Trento.Users.PersonalAccessTokens
  alias Trento.Users.User

  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT
  alias TrentoWeb.OpenApi.V1.Schema

  plug TrentoWeb.Plugs.LoadUserPlug

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :create_personal_access_token,
    summary: "Creates a new Personal Access Token",
    tags: ["Profile"],
    request_body:
      {"CreatePersonalAccessToken", "application/json",
       Schema.PersonalAccessToken.CreatePersonalAccessToken},
    responses: [
      created:
        {"Personal Access Token created successfully", "application/json",
         Schema.PersonalAccessToken.CreatedPersonalAccessToken},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def create_personal_access_token(conn, _) do
    body_params = OpenApiSpex.body_params(conn)

    %User{id: user_id} = current_user = Pow.Plug.current_user(conn)

    with {:ok,
          %UserPersonalAccessToken{
            jti: jti,
            created_at: created_at,
            expire_at: expire_at
          } = pat} <- PersonalAccessTokens.create_personal_access_token(current_user, body_params) do
      claims = %{
        "jti" => jti,
        "sub" => user_id
      }

      conn
      |> put_status(:created)
      |> render(:new_personal_access_token, %{
        personal_access_token: pat,
        generated_token: PAT.generate!(claims, created_at, expire_at)
      })
    end
  end
end

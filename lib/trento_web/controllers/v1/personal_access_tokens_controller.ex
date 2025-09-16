defmodule TrentoWeb.V1.PersonalAccessTokensController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.PersonalAccessTokens
  alias Trento.PersonalAccessTokens.PersonalAccessToken, as: UserPersonalAccessToken
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
            expires_at: expires_at
          } = pat} <- PersonalAccessTokens.create_personal_access_token(current_user, body_params) do
      claims = %{
        "jti" => jti,
        "sub" => user_id
      }

      conn
      |> put_status(:created)
      |> render(:new_personal_access_token, %{
        personal_access_token: pat,
        generated_token: PAT.generate!(claims, created_at, expires_at)
      })
    end
  end

  operation :revoke_personal_access_token,
    summary: "Revokes an existing Personal Access Token",
    tags: ["Profile"],
    parameters: [
      jti: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "550e8400-e29b-41d4-a716-446655440000"
        }
      ]
    ],
    responses: [
      no_content: "Personal Access Token revoked successfully",
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def revoke_personal_access_token(conn, %{jti: jti}) do
    with {:ok, _} <-
           conn
           |> Pow.Plug.current_user()
           |> PersonalAccessTokens.revoke_personal_access_token(jti) do
      send_resp(conn, :no_content, "")
    end
  end
end

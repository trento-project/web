defmodule TrentoWeb.V1.PersonalAccessTokensController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.PersonalAccessTokens
  alias Trento.PersonalAccessTokens.PersonalAccessToken, as: UserPersonalAccessToken
  alias Trento.Users.User

  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT
  alias TrentoWeb.OpenApi.V1.Schema

  import Plug.Conn

  plug TrentoWeb.Plugs.LoadUserPlug

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :create_personal_access_token,
    summary: "Creates a new Personal Access Token",
    description:
      "Creates a new Personal Access Token for the currently authenticated user, allowing programmatic access to the APIs.",
    tags: ["Profile"],
    request_body:
      {"CreatePersonalAccessToken", "application/json",
       Schema.PersonalAccessToken.CreatePersonalAccessToken},
    responses: [
      created:
        {"Personal Access Token created successfully.", "application/json",
         Schema.PersonalAccessToken.CreatedPersonalAccessToken},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def create_personal_access_token(conn, _) do
    %User{} = current_user = Pow.Plug.current_user(conn)

    plain_pat = PAT.generate()

    creation_params =
      conn
      |> OpenApiSpex.body_params()
      |> Map.put(:token, plain_pat)

    with {:ok, %UserPersonalAccessToken{} = pat} <-
           PersonalAccessTokens.create_personal_access_token(current_user, creation_params) do
      conn
      |> put_status(:created)
      |> render(:new_personal_access_token, %{
        personal_access_token: pat,
        generated_token: plain_pat
      })
    end
  end

  operation :revoke_personal_access_token,
    summary: "Revokes an existing Personal Access Token",
    description:
      "Revokes a Personal Access Token identified by its unique identifier, ensuring that it can no longer be used for authentication.",
    tags: ["Profile"],
    parameters: [
      token_id: [
        in: :path,
        required: true,
        description: "The unique identifier of the Personal Access Token to be revoked.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "550e8400-e29b-41d4-a716-446655440000"
        }
      ]
    ],
    responses: [
      no_content: "Personal Access Token revoked successfully.",
      not_found: Schema.NotFound.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def revoke_personal_access_token(conn, %{token_id: token_id}) do
    with {:ok, token} <-
           conn
           |> Pow.Plug.current_user()
           |> PersonalAccessTokens.revoke_personal_access_token(token_id) do
      # add deleted token to assigns to use in the activity log
      conn
      |> assign(:deleted_token, token)
      |> send_resp(:no_content, "")
    end
  end
end

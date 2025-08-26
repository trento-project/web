defmodule TrentoWeb.V1.ApiKeysController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users.ApiKey, as: UserApiKey
  alias Trento.Users.ApiKeys
  alias Trento.Users.User

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.OpenApi.V1.Schema

  plug TrentoWeb.Plugs.LoadUserPlug

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :get_api_keys,
    summary: "Retrieves the Api Keys for the currently authenticated user",
    tags: ["Profile"],
    responses: [
      ok: {"Api Keys successfully loaded", "application/json", Schema.ApiKey.ApiKeyCollection},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def get_api_keys(conn, _) do
    render(conn, :api_keys, %{
      api_keys:
        conn
        |> Pow.Plug.current_user()
        |> ApiKeys.get_api_keys()
    })
  end

  operation :create_api_key,
    summary: "Creates a new Api key",
    tags: ["Profile"],
    request_body: {"CreateApiKey", "application/json", Schema.ApiKey.CreateApiKey},
    responses: [
      created:
        {"Api Key created successfully", "application/json", Schema.ApiKey.NewlyCreatedApiKey},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def create_api_key(conn, _) do
    body_params = OpenApiSpex.body_params(conn)

    %User{id: user_id, abilities: abilities} = current_user = Pow.Plug.current_user(conn)

    with {:ok,
          %UserApiKey{
            id: api_key_id,
            created_at: created_at,
            expire_at: expire_at
          } = api_key} <- ApiKeys.create_api_key(current_user, body_params) do
      expiration =
        if expire_at,
          do: DateTime.to_unix(expire_at),
          else: nil

      access_token =
        AccessToken.generate_access_token!(%{
          "sub" => user_id,
          "exp" => expiration,
          "iat" => DateTime.to_unix(created_at),
          "nbf" => DateTime.to_unix(created_at),
          "token_id" => api_key_id,
          "abilities" => Enum.map(abilities, &%{name: &1.name, resource: &1.resource})
        })

      conn
      |> put_status(:created)
      |> render(:new_api_key, %{
        api_key: api_key,
        generated_token: access_token
      })
    end
  end

  operation :revoke_api_key,
    summary: "Revokes an existing API key",
    tags: ["Profile"],
    parameters: [
      name: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      no_content: "API Key revoked successfully",
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def revoke_api_key(conn, %{name: name}) do
    with {:ok, _} <-
           conn
           |> Pow.Plug.current_user()
           |> ApiKeys.revoke_api_key(name) do
      send_resp(conn, :no_content, "")
    end
  end
end

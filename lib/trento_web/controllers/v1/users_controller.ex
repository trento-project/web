defmodule TrentoWeb.V1.UsersController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity

  alias TrentoWeb.OpenApi.V1.Schema.User.{
    UserCollection,
    UserCreationRequest,
    UserItem,
    UserUpdateRequest
  }

  plug TrentoWeb.Plugs.ExternalIdpGuardPlug when action in [:create]

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Users.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  action_fallback TrentoWeb.FallbackController

  operation :index,
    summary: "Gets the list of users in the system",
    tags: ["User Management"],
    responses: [
      ok: {"List of users in the system", "application/json", UserCollection}
    ]

  def index(conn, _params) do
    users = Users.list_users()
    render(conn, "index.json", users: users)
  end

  operation :create,
    summary: "Create a new User",
    tags: ["User Management"],
    request_body: {"UserCreationRequest", "application/json", UserCreationRequest},
    responses: [
      created: {"User saved successfully", "application/json", UserItem},
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def create(%{body_params: user_params} = conn, _) do
    with {:ok, %User{} = user} <- Users.create_user(user_params) do
      conn
      |> put_status(:created)
      |> attach_user_version_as_etag_header(user)
      |> render("show.json", user: user)
    end
  end

  operation :show,
    summary: "Show the details of a user",
    tags: ["User Management"],
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :integer}
      ]
    ],
    responses: [
      ok:
        {"UserItem", "application/json", UserItem,
         headers: %{
           etag: %{
             required: true,
             description: "Entity version, used in conditional http requests",
             type: %OpenApiSpex.Schema{type: :string},
             allowEmptyValues: false
           }
         }},
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def show(conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id),
         conn <- attach_user_version_as_etag_header(conn, user) do
      render(conn, "show.json", user: user)
    end
  end

  operation :update,
    summary: "Update an existing user",
    tags: ["User Management"],
    description:
      "Update an existing user, this is a conditional HTTP request, make sure you provide precondition with the If-Match header",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :integer}
      ],
      "if-match": [
        # The field is required, we put to false to avoid openapispex validate that value with 422 status code.
        required: false,
        in: :header,
        type: %OpenApiSpex.Schema{type: :integer}
      ]
    ],
    request_body: {"UserUpdateRequest", "application/json", UserUpdateRequest},
    responses: [
      created:
        {"User updated successfully", "application/json", UserItem,
         headers: %{
           etag: %{
             required: true,
             description: "Entity version, used in conditional http requests",
             type: %OpenApiSpex.Schema{type: :string},
             allowEmptyValues: false
           }
         }},
      unprocessable_entity: UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response(),
      precondition_failed: Schema.PreconditionFailed.response(),
      precondition_required: Schema.PreconditionRequired.response()
    ]

  def update(%{body_params: body_params} = conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id),
         {:ok, lock_version} <- user_version_from_if_match_header(conn),
         body_params <-
           clean_params_for_sso_integration(body_params, sso_enabled?()),
         update_params <- Map.put(body_params, :lock_version, lock_version),
         {:ok, %User{} = user} <- Users.update_user(user, update_params),
         :ok <- broadcast_update_or_locked_user(user),
         conn <- attach_user_version_as_etag_header(conn, user) do
      render(conn, "show.json", user: user)
    end
  end

  operation :delete,
    summary: "Delete a user",
    tags: ["User Management"],
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :integer}
      ]
    ],
    responses: [
      not_found: Schema.NotFound.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def delete(conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id),
         {:ok, %User{}} <- Users.delete_user(user),
         :ok <- TrentoWeb.Endpoint.broadcast("users:#{id}", "user_deleted", %{}) do
      send_resp(conn, :no_content, "")
    end
  end

  def get_policy_resource(_), do: Trento.Users.User

  defp broadcast_update_or_locked_user(%User{id: id, locked_at: nil}),
    do: TrentoWeb.Endpoint.broadcast("users:#{id}", "user_updated", %{})

  defp broadcast_update_or_locked_user(%User{id: id}),
    do: TrentoWeb.Endpoint.broadcast("users:#{id}", "user_locked", %{})

  defp user_version_from_if_match_header(conn) do
    case get_req_header(conn, "if-match") do
      [version] -> {:ok, version}
      _ -> {:error, :precondition_missing}
    end
  end

  defp attach_user_version_as_etag_header(conn, %User{lock_version: lock_version}) do
    put_resp_header(conn, "etag", Integer.to_string(lock_version))
  end

  # when sso is enabled, we only allow abilities and enabled as parameters
  defp clean_params_for_sso_integration(attrs, true), do: Map.take(attrs, [:abilities, :enabled])
  defp clean_params_for_sso_integration(attrs, _), do: attrs

  defp oidc_enabled?, do: Application.fetch_env!(:trento, :oidc)[:enabled]
  defp oauth2_enabled?, do: Application.fetch_env!(:trento, :oauth2)[:enabled]
  defp saml_enabled?, do: Application.fetch_env!(:trento, :saml)[:enabled]

  defp sso_enabled?, do: oidc_enabled?() or oauth2_enabled?() or saml_enabled?()
end

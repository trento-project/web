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
    summary: "Gets the list of users in the system.",
    description:
      "Retrieves a comprehensive list of all users currently registered in the system, supporting user management and administrative tasks.",
    tags: ["User Management"],
    responses: [
      ok:
        {"Comprehensive list of all users currently registered in the system for user management and administrative tasks.",
         "application/json", UserCollection}
    ]

  def index(conn, _params) do
    users = Users.list_users()
    render(conn, :index, users: users)
  end

  operation :create,
    summary: "Create a new User.",
    description:
      "Creates a new user account in the system, supporting onboarding and user management for administrators.",
    tags: ["User Management"],
    request_body:
      {"Request containing new user account information for onboarding and user management.",
       "application/json", UserCreationRequest},
    responses: [
      created:
        {"User account created successfully, returning the new user details for management and review.",
         "application/json", UserItem},
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def create(%{body_params: user_params} = conn, _) do
    with {:ok, %User{} = user} <- Users.create_user(user_params) do
      conn
      |> put_status(:created)
      |> attach_user_version_as_etag_header(user)
      |> render(:show, user: user)
    end
  end

  operation :show,
    summary: "Show the details of a user.",
    description:
      "Returns detailed information about a specific user, identified by their unique ID, supporting user management and administrative review.",
    tags: ["User Management"],
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the user whose details are being requested. This value must be an integer.",
        required: true,
        schema: %OpenApiSpex.Schema{type: :integer, example: 1}
      ]
    ],
    responses: [
      ok:
        {"Detailed information about the specified user, including entity version for concurrency control.",
         "application/json", UserItem,
         headers: %{
           etag: %{
             required: true,
             description:
               "The entity version of the user, used for conditional HTTP requests and concurrency control.",
             schema: %OpenApiSpex.Schema{type: :string}
           }
         }},
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def show(conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id),
         conn <- attach_user_version_as_etag_header(conn, user) do
      render(conn, :show, user: user)
    end
  end

  operation :update,
    summary: "Update an existing user.",
    tags: ["User Management"],
    description:
      "Updates the details of an existing user. This is a conditional HTTP request; you must provide the entity version using the If-Match header to ensure safe updates and concurrency control.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the user to be updated. This value must be an integer.",
        required: true,
        schema: %OpenApiSpex.Schema{type: :integer, example: 1}
      ],
      "if-match": [
        # The field is required, we put to false to avoid openapispex validate that value with 422 status code.
        required: false,
        in: :header,
        description:
          "The entity version of the user, provided in the If-Match header, to ensure safe and conditional updates.",
        schema: %OpenApiSpex.Schema{type: :integer, example: 2}
      ]
    ],
    request_body:
      {"Request containing updated user information and entity version for safe and conditional updates.",
       "application/json", UserUpdateRequest},
    responses: [
      created:
        {"User account updated successfully, returning the updated user details and entity version for concurrency control.",
         "application/json", UserItem,
         headers: %{
           etag: %{
             required: true,
             description:
               "The entity version of the user, used for conditional HTTP requests and concurrency control.",
             schema: %OpenApiSpex.Schema{type: :string}
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
      render(conn, :show, user: user)
    end
  end

  operation :delete,
    summary: "Delete a user.",
    description:
      "Removes a user account from the system, supporting user management and administrative cleanup.",
    tags: ["User Management"],
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the user to be deleted. This value must be an integer.",
        required: true,
        schema: %OpenApiSpex.Schema{type: :integer, example: 1}
      ]
    ],
    responses: [
      no_content:
        "User account has been successfully deleted from the system, supporting administrative cleanup.",
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

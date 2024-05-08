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
      ok: {"UserItem", "application/json", UserItem},
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def show(conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id) do
      render(conn, "show.json", user: user)
    end
  end

  operation :update,
    summary: "Update an existing user",
    tags: ["User Management"],
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :integer}
      ]
    ],
    request_body: {"UserUpdateRequest", "application/json", UserUpdateRequest},
    responses: [
      created: {"User updated successfully", "application/json", UserItem},
      unprocessable_entity: UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def update(%{body_params: body_params} = conn, %{id: id}) do
    with {:ok, user} <- Users.get_user(id),
         {:ok, %User{} = user} <- Users.update_user(user, body_params),
         :ok <- broadcast_update_or_locked_user(user) do
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
end

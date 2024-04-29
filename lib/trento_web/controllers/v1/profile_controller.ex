defmodule TrentoWeb.V1.ProfileController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema
  alias Trento.Users

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :show,
    summary: "Get profile",
    tags: ["Platform"],
    description: "Retrieve the current user profile",
    responses: [
      ok: {"The user profile", "application/json", Schema.User.UserProfile}
    ]

  def show(conn, _) do
    with %{"user_id" => user_id} <- Pow.Plug.current_user(conn),
         {user_id, _} <- Integer.parse(user_id),
         {:ok, user} <- Users.get_user(user_id) do
      render(conn, "profile.json", user: user)
    end
  end

  operation :update,
    summary: "Update the current user profile",
    tags: ["Platform"],
    request_body:
      {"UserProfileUpdateRequest", "application/json", Schema.User.UserProfileUpdateRequest},
    responses: [
      created: {"Profile updated successfully", "application/json", Schema.User.UserProfile},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update(conn, _) do
  end
end

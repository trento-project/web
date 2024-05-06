defmodule TrentoWeb.V1.ProfileController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  plug TrentoWeb.Plugs.LoadUserPlug
  action_fallback TrentoWeb.FallbackController

  operation :show,
    summary: "Get profile",
    tags: ["Platform"],
    description: "Retrieve the current user profile",
    responses: [
      ok: {"The user profile", "application/json", Schema.User.UserProfile}
    ]

  def show(conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)
    render(conn, "profile.json", user: user)
  end

  operation :update,
    summary: "Update the current user profile",
    tags: ["Platform"],
    request_body:
      {"UserProfileUpdateRequest", "application/json", Schema.User.UserProfileUpdateRequest},
    responses: [
      ok: {"Profile updated successfully", "application/json", Schema.User.UserProfile},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def update(%{body_params: profile_params} = conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)

    with {:ok, %User{} = updated_user} <- Users.update_user_profile(user, profile_params) do
      render(conn, "profile.json", user: updated_user)
    end
  end
end

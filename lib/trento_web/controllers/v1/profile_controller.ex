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
    parameters: [
      "if-match": [
        # The field is required, we put to false to avoid openapispex validate that value with 422 status code.
        required: false,
        in: :header,
        type: %OpenApiSpex.Schema{type: :integer}
      ]
    ],
    request_body:
      {"UserProfileUpdateRequest", "application/json", Schema.User.UserProfileUpdateRequest},
    responses: [
      ok: {"Profile updated successfully", "application/json", Schema.User.UserProfile},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response(),
      precondition_failed: Schema.PreconditionFailed.response(),
      precondition_required: Schema.PreconditionRequired.response()
    ]

  def update(%{body_params: profile_params} = conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)

    with {:ok, lock_version} <- user_version_from_if_match_header(conn),
         update_params <- Map.put(profile_params, :lock_version, lock_version),
         {:ok, %User{} = updated_user} <- Users.update_user_profile(user, update_params),
         conn <- attach_user_version_as_etag_header(conn, updated_user) do
      render(conn, "profile.json", user: updated_user)
    end
  end

  defp user_version_from_if_match_header(conn) do
    case get_req_header(conn, "if-match") do
      [version] -> {:ok, version}
      _ -> {:error, :precondition_missing}
    end
  end

  defp attach_user_version_as_etag_header(conn, %User{lock_version: lock_version}) do
    put_resp_header(conn, "etag", Integer.to_string(lock_version))
  end
end

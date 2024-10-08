defmodule TrentoWeb.V1.ProfileController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema

  plug TrentoWeb.Plugs.ExternalIdpGuardPlug
       when action in [:update, :reset_totp, :get_totp_enrollment_data, :confirm_totp_enrollment]

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
    render(conn, :profile, user: user)
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

  def update(conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)
    profile_params = OpenApiSpex.body_params(conn)

    with {:ok, %User{} = updated_user} <- Users.update_user_profile(user, profile_params) do
      render(conn, :profile, user: updated_user)
    end
  end

  operation :reset_totp,
    summary: "Reset the TOTP configuration for the user",
    tags: ["Platform"],
    responses: [
      forbidden: Schema.Forbidden.response(),
      no_content: "User TOTP enrollment reset."
    ]

  def reset_totp(conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)

    with {:ok, %User{}} <- Users.reset_totp(user) do
      send_resp(conn, :no_content, "")
    end
  end

  operation :get_totp_enrollment_data,
    summary: "Get TOTP enrollment data",
    tags: ["Platform"],
    responses: [
      ok:
        {"UserTOTPEnrollmentPayload", "application/json", Schema.User.UserTOTPEnrollmentPayload},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def get_totp_enrollment_data(conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)

    with {:ok, enrollment_payload} <- Users.initiate_totp_enrollment(user) do
      render(conn, :totp_enrollment_data, enrollment_payload: enrollment_payload)
    end
  end

  operation :confirm_totp_enrollment,
    summary: "Confirm TOTP enrollment procedure",
    tags: ["Platform"],
    request_body:
      {"UserTOTPEnrollmentConfirmRequest", "application/json",
       Schema.User.UserTOTPEnrollmentConfirmRequest},
    responses: [
      ok:
        {"TOTP Enrollment completed", "application/json",
         Schema.User.UserTOTPEnrollmentConfirmPayload},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def confirm_totp_enrollment(conn, _) do
    %User{} = user = Pow.Plug.current_user(conn)

    %{totp_code: totp_code} = OpenApiSpex.body_params(conn)

    with {:ok, %User{totp_enabled_at: totp_enabled_at}} <-
           Users.confirm_totp_enrollment(user, totp_code) do
      render(conn, :totp_enrollment_completed, %{totp_enabled_at: totp_enabled_at})
    end
  end
end

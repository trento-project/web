defmodule TrentoWeb.V1.ProfileView do
  use TrentoWeb, :view

  alias TrentoWeb.V1.AbilityView

  def render("profile.json", %{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          abilities: abilities,
          password_change_requested_at: password_change_requested_at,
          totp_enabled_at: totp_enabled_at,
          user_identities: user_identities,
          inserted_at: created_at,
          updated_at: updated_at
        }
      }) do
    %{
      id: id,
      fullname: fullname,
      username: username,
      email: email,
      abilities: render_many(abilities, AbilityView, "ability.json", as: :ability),
      password_change_requested: password_change_requested_at != nil,
      totp_enabled: totp_enabled_at != nil,
      created_at: created_at,
      idp_user: length(user_identities) > 0,
      updated_at: updated_at
    }
  end

  def render("totp_enrollment_completed.json", %{
        totp_enabled_at: totp_enabled_at
      }),
      do: %{totp_enabled_at: totp_enabled_at}

  def render("totp_enrollment_data.json", %{
        enrollment_payload: %{
          secret: secret,
          secret_qr_encoded: secret_qr_encoded
        }
      }),
      do: %{secret: Base.encode32(secret, padding: false), secret_qr_encoded: secret_qr_encoded}
end

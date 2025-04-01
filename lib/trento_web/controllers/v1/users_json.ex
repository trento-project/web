defmodule TrentoWeb.V1.UsersJSON do
  alias TrentoWeb.V1.AbilityJSON

  def index(%{users: users}), do: Enum.map(users, &user(%{user: &1}))

  def show(%{user: user}), do: user(%{user: user})

  def user(%{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          abilities: abilities,
          locked_at: locked_at,
          password_change_requested_at: password_change_requested_at,
          user_identities: user_identities,
          totp_enabled_at: totp_enabled_at,
          analytics_enabled_at: analytics_enabled_at,
          inserted_at: created_at,
          updated_at: updated_at
        }
      }),
      do: %{
        id: id,
        fullname: fullname,
        username: username,
        email: email,
        abilities: Enum.map(abilities, &AbilityJSON.ability/1),
        enabled: locked_at == nil,
        idp_user: length(user_identities) > 0,
        password_change_requested_at: password_change_requested_at,
        totp_enabled_at: totp_enabled_at,
        analytics_enabled_at: analytics_enabled_at,
        created_at: created_at,
        updated_at: updated_at
      }
end

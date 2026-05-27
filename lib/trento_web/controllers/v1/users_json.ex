# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.UsersJSON do
  alias TrentoWeb.V1.{AbilityJSON, PersonalAccessTokensJSON}

  def index(%{users: users}), do: Enum.map(users, &user(%{user: &1}))

  def show(%{user: user}), do: user(%{user: user})

  def user(%{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          abilities: abilities,
          personal_access_tokens: personal_access_tokens,
          locked_at: locked_at,
          password_change_requested_at: password_change_requested_at,
          user_identities: user_identities,
          totp_enabled_at: totp_enabled_at,
          analytics_enabled_at: analytics_enabled_at,
          timezone: timezone,
          last_login_at: last_login_at,
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
        personal_access_tokens:
          PersonalAccessTokensJSON.personal_access_tokens(personal_access_tokens),
        enabled: locked_at == nil,
        idp_user: user_identities != [],
        password_change_requested_at: password_change_requested_at,
        totp_enabled_at: totp_enabled_at,
        analytics_enabled: analytics_enabled_at != nil,
        timezone: timezone,
        last_login_at: last_login_at,
        created_at: created_at,
        updated_at: updated_at
      }
end

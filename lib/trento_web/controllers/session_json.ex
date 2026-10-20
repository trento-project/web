# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.SessionJSON do
  def logged(%{token: token, expiration: expiration, refresh_token: refresh_token}),
    do: %{access_token: token, expires_in: expiration, refresh_token: refresh_token}

  def refreshed(%{token: token, expiration: expiration}),
    do: %{access_token: token, expires_in: expiration}

  def introspected_token(%{claims: claims}), do: claims
end

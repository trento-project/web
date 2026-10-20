# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.UserIdentities.UserIdentity do
  @moduledoc false
  use Ecto.Schema
  use PowAssent.Ecto.UserIdentities.Schema, user: Trento.Users.User

  schema "user_identities" do
    pow_assent_user_identity_fields()

    timestamps()
  end
end

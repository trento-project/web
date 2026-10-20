# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo do
  use Ecto.Repo,
    otp_app: :trento,
    adapter: Ecto.Adapters.Postgres
end

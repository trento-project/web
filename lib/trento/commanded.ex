# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Commanded do
  @moduledoc """
  Trento Commanded Application
  """

  use Commanded.Application, otp_app: :trento

  router(Trento.Router)
end

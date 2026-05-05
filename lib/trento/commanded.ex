# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Commanded do
  @moduledoc """
  Trento Commanded Application
  """

  use Commanded.Application, otp_app: :trento

  router(Trento.Router)
end

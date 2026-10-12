# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Vault do
  @moduledoc """
  Trento secret vault.
  """

  use Cloak.Vault, otp_app: :trento
end

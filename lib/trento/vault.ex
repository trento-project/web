# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Vault do
  @moduledoc """
  Trento secret vault.
  """

  use Cloak.Vault, otp_app: :trento
end

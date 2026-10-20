# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.Ecto.EncryptedBinary do
  @moduledoc """
  Ecto Type that represents an encrypted binary.
  """

  use Cloak.Ecto.Binary, vault: Trento.Vault
end

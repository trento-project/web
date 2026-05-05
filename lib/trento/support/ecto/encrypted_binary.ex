# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.Ecto.EncryptedBinary do
  @moduledoc """
  Ecto Type that represents an encrypted binary.
  """

  use Cloak.Ecto.Binary, vault: Trento.Vault
end

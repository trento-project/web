defmodule Trento.Vault do
  @moduledoc """
  Trento secret vault.
  """

  use Cloak.Vault, otp_app: :trento
end

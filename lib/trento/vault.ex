defmodule Trento.Vault do
  @moduledoc """
  Trento secret vault.
  """

  use Boundary
  use Cloak.Vault, otp_app: :trento
end

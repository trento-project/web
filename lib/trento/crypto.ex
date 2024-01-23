defmodule Trento.Crypto do
  @moduledoc """
  Cryptography-related functions
  """

  alias Trento.Vault

  @spec encrypt(String.t()) :: binary()
  def encrypt(plaintext) do
    Vault.encrypt!(plaintext)
  end

  @spec decrypt(binary()) :: String.t()
  def decrypt(ciphertext) do
    Vault.decrypt!(ciphertext)
  end
end

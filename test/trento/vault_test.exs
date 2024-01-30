defmodule Trento.VaultTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.Vault

  @moduletag :integration

  test "should encrypt plain content" do
    secrets = ["secret1", "secret2", "secret3"]

    Enum.each(secrets, fn secret ->
      encrypted = Vault.encrypt!(secret)
      refute secret == encrypted

      decrypted = Vault.decrypt!(encrypted)
      assert secret == decrypted
    end)
  end

  test "should decrypt to plain content" do
    encrypted_secrets = [
      secret1: "AQpBRVMuR0NNLlYxFfriIjwvlSpxauFgAO7uyQ4DKNGcMrFftjcubG4fjSf33v0=",
      secret2: "AQpBRVMuR0NNLlYxIIXMVZMrSg2PbZ021BLaDl4d7l5zWH4QL1r2zmmzfy4V+0U=",
      secret3: "AQpBRVMuR0NNLlYxyd5zqVXmqEFQhmLUNxILtIy2UcaNsnKlFxxAys+w7AYPRvM="
    ]

    Enum.each(encrypted_secrets, fn {decrypted, encrypted} ->
      plaintext = encrypted |> Base.decode64!() |> Vault.decrypt!()
      assert plaintext == Atom.to_string(decrypted)
    end)
  end
end

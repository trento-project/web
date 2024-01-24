defmodule Trento.CryptoTest do
  use ExUnit.Case

  alias Trento.Crypto

  @moduletag :integration

  test "Encrypt plaintext" do
    ciphertext = Crypto.encrypt("plaintext")

    assert ciphertext |> Base.encode64() |> String.contains?("AQpBRVMuR0NNLlYx")
  end

  test "Decrypt ciphertext" do
    {:ok, cipher} =
      Base.decode64("AQpBRVMuR0NNLlYx4RLNPaaswB2btzz3MpcEzI4sMA/QF1K3/6+vmjOs+4EWcZMs0Q==")

    plaintext = Crypto.decrypt(cipher)

    assert plaintext == "plaintext"
  end
end

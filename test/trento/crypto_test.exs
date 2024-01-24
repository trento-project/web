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
      Base.decode64("AQpBRVMuR0NNLlYx/uUn6PSN8B959qSQadjgtJoIJJYrAisnvi8XaXomB8z4SjZkIQ==")

    plaintext = Crypto.decrypt(cipher)

    assert plaintext == "plaintext"
  end
end

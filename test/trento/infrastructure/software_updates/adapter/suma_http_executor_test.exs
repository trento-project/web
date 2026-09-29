# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.SoftwareUpdates.Adapter.SumaHttpExecutorTest do
  use ExUnit.Case

  alias Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  def load_certificate_content(name) do
    File.cwd!()
    |> Path.join("/test/fixtures/cert")
    |> Path.join(name)
    |> File.read!()
  end

  describe "Http executor certificate handling" do
    test "should support chained certificates" do
      scenarios = [
        %{cert: "one_entry_chain.pem", expected_entries: 1},
        %{cert: "two_entries_chain.pem", expected_entries: 2},
        %{cert: "three_entries_chain.pem", expected_entries: 3}
      ]

      for %{cert: cert, expected_entries: expected_entries} <- scenarios do
        assert cert
               |> load_certificate_content()
               |> HttpExecutor.get_cert_der()
               |> length() == expected_entries
      end
    end

    test "should preserve exact DER bytes and signature validity without re-encoding" do
      # non_canonical_der_ca.pem has an explicit `critical FALSE` in an extension,
      # which is dropped when the certificate is decoded and re-encoded.
      for fixture <- ["one_entry_chain.pem", "non_canonical_der_ca.pem"] do
        cert_pem = load_certificate_content(fixture)
        [{:Certificate, expected_der, :not_encrypted}] = :public_key.pem_decode(cert_pem)

        assert [actual_der] = HttpExecutor.get_cert_der(cert_pem)
        assert actual_der == expected_der
      end

      private_key = X509.PrivateKey.new_rsa(1024)

      self_signed_pem =
        private_key
        |> X509.Certificate.self_signed("/CN=Test CA")
        |> X509.Certificate.to_pem()

      assert [self_signed_der] = HttpExecutor.get_cert_der(self_signed_pem)
      cert = X509.Certificate.from_der!(self_signed_der)
      public_key = X509.Certificate.public_key(cert)
      assert :public_key.pkix_verify(self_signed_der, public_key)
    end
  end
end

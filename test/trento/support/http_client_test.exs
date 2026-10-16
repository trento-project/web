# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.HttpClientTest do
  use ExUnit.Case, async: true

  require Record

  alias Trento.Support.HttpClient

  Record.defrecordp(
    :extension,
    :Extension,
    Record.extract(:Extension, from_lib: "public_key/include/public_key.hrl")
  )

  @server_auth {1, 3, 6, 1, 5, 5, 7, 3, 1}
  @client_auth {1, 3, 6, 1, 5, 5, 7, 3, 2}
  @code_signing {1, 3, 6, 1, 5, 5, 7, 3, 3}

  @host "trento.local"
  @url "https://#{@host}/wanda/api/all/openapi"

  setup_all do
    san =
      extension(
        extnID: {2, 5, 29, 17},
        critical: false,
        extnValue: [dNSName: String.to_charlist(@host)]
      )

    %{server_config: server} =
      :public_key.pkix_test_data(%{
        server_chain: %{root: [], intermediates: [[]], peer: [extensions: [san]]},
        client_chain: %{root: [], intermediates: [], peer: []}
      })

    [ca_der | _] = Keyword.fetch!(server, :cacerts)

    %{
      ca: :public_key.pkix_decode_cert(ca_der, :otp),
      peer: :public_key.pkix_decode_cert(Keyword.fetch!(server, :cert), :otp),
      key_usage_mismatch: key_usage_mismatch([@server_auth])
    }
  end

  describe "TLS verify_fun workaround for OTP 27.1.3 key usage check" do
    test "without the workaround, hackney rejects a CA certificate reported with key_usage_mismatch",
         %{ca: ca, key_usage_mismatch: event} do
      {default_fun, state} =
        @host
        |> String.to_charlist()
        |> :hackney_ssl.check_hostname_opts()
        |> Keyword.fetch!(:verify_fun)

      assert {:fail, {:bad_cert, {:key_usage_mismatch, _}}} = default_fun.(ca, event, state)
    end

    test "with the workaround, a CA certificate reported with key_usage_mismatch is accepted",
         %{ca: ca, key_usage_mismatch: event} do
      {verify_fun, state} = verify_fun(@url)

      assert {:valid, ^state} = verify_fun.(ca, event, state)
    end

    test "a CA certificate whose extKeyUsage lists serverAuth and clientAuth is accepted",
         %{ca: ca} do
      {verify_fun, state} = verify_fun(@url)

      assert {:valid, ^state} =
               verify_fun.(ca, key_usage_mismatch([@server_auth, @client_auth]), state)
    end

    test "a CA certificate whose extKeyUsage adds a non-TLS purpose is still rejected",
         %{ca: ca} do
      {verify_fun, state} = verify_fun(@url)

      assert {:fail, {:bad_cert, {:key_usage_mismatch, _}}} =
               verify_fun.(ca, key_usage_mismatch([@server_auth, @code_signing]), state)
    end

    test "an end-entity certificate reported with key_usage_mismatch is still rejected",
         %{peer: peer, key_usage_mismatch: event} do
      {verify_fun, state} = verify_fun(@url)

      assert {:fail, {:bad_cert, {:key_usage_mismatch, _}}} = verify_fun.(peer, event, state)
    end

    test "other certificate errors are still rejected", %{ca: ca} do
      {verify_fun, state} = verify_fun(@url)

      assert {:fail, {:bad_cert, :unknown_ca}} = verify_fun.(ca, {:bad_cert, :unknown_ca}, state)
    end

    test "the peer certificate must still match the requested host", %{peer: peer} do
      {verify_fun, state} = verify_fun(@url)
      assert {:valid, _} = verify_fun.(peer, :valid_peer, state)

      {verify_fun, state} = verify_fun("https://other.example/wanda")
      assert {:fail, _} = verify_fun.(peer, :valid_peer, state)
    end

    test "the hostname check follows a server_name_indication override", %{peer: peer} do
      {verify_fun, state} =
        verify_fun("https://10.0.0.1/wanda", server_name_indication: String.to_charlist(@host))

      assert {:valid, _} = verify_fun.(peer, :valid_peer, state)
    end

    test "verify: :verify_none gets no workaround verify_fun" do
      ssl = @url |> HttpClient.inject_ssl(ssl: [verify: :verify_none]) |> Keyword.fetch!(:ssl)

      assert :verify_none = Keyword.fetch!(ssl, :verify)
      refute Keyword.has_key?(ssl, :verify_fun)
    end

    test "a caller verify_fun is kept" do
      caller_verify_fun = {fn _, _, state -> {:valid, state} end, :caller_state}

      ssl =
        @url
        |> HttpClient.inject_ssl(ssl: [verify_fun: caller_verify_fun])
        |> Keyword.fetch!(:ssl)

      assert [^caller_verify_fun] = Keyword.get_values(ssl, :verify_fun)
    end
  end

  defp verify_fun(url, ssl \\ []),
    do:
      url
      |> HttpClient.inject_ssl(ssl: ssl)
      |> Keyword.fetch!(:ssl)
      |> Keyword.fetch!(:verify_fun)

  # The event OTP 27.1.3 raises for a CA with keyUsage [keyCertSign, cRLSign]
  # and the given extKeyUsage purposes:
  # https://github.com/erlang/otp/blob/OTP-27.1.3/lib/public_key/src/pubkey_cert.erl#L892
  defp key_usage_mismatch(purposes) do
    {:bad_cert,
     {:key_usage_mismatch,
      {extension(extnID: {2, 5, 29, 15}, critical: true, extnValue: [:keyCertSign, :cRLSign]),
       extension(extnID: {2, 5, 29, 37}, critical: false, extnValue: purposes)}}}
  end
end

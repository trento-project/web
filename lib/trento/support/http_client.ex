# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.HttpClient do
  @moduledoc """
  Shared HTTP client behaviour wrapping `HTTPoison`. The default implementation
  forwards to HTTPoison and injects secure SSL defaults (`verify_peer` with the
  system CA bundle); callers can override individual SSL keys by passing their
  own `:ssl` keyword. Tests substitute a Mox mock via config.
  """

  require Logger
  require Record

  alias X509.Certificate
  alias X509.Certificate.Extension

  @public_key_hrl "public_key/include/public_key.hrl"
  Record.defrecordp(:extension, :Extension, Record.extract(:Extension, from_lib: @public_key_hrl))

  Record.defrecordp(
    :basic_constraints,
    :BasicConstraints,
    Record.extract(:BasicConstraints, from_lib: @public_key_hrl)
  )

  @callback get(url :: String.t(), headers :: list(), options :: keyword()) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback request(
              verb :: atom(),
              url :: String.t(),
              body :: binary(),
              headers :: list(),
              options :: keyword()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour __MODULE__

  @impl true
  def get(url, headers \\ [], options \\ []),
    do: HTTPoison.get(url, headers, inject_ssl(url, options))

  @impl true
  def request(verb, url, body, headers, options),
    do: HTTPoison.request(verb, url, body, headers, inject_ssl(url, options))

  @doc false
  def inject_ssl(url, options) do
    default_ssl = [verify: :verify_peer, cacerts: :public_key.cacerts_get()]
    ssl = Keyword.merge(default_ssl, Keyword.get(options, :ssl, []))
    Keyword.put(options, :ssl, ssl ++ verify_fun(url, ssl))
  end

  # Workaround for an OTP 27.1.3 bug. Remove it once SUSE's erlang ships the fix.
  #
  # OTP 27.1.3 checks that keyUsage and extKeyUsage agree, but applies the
  # end-entity rule to CA certificates. A CA with keyUsage [keyCertSign, cRLSign]
  # and extKeyUsage [serverAuth], such as Let's Encrypt's cross-signed ISRG Root YR,
  # then fails with {:bad_cert, {:key_usage_mismatch, _}}.
  # - bug: https://github.com/erlang/otp/issues/9208
  # - faulty rule: https://github.com/erlang/otp/blob/OTP-27.1.3/lib/public_key/src/pubkey_cert.erl#L1808
  # - error raised through verify_fun: https://github.com/erlang/otp/blob/OTP-27.1.3/lib/public_key/src/pubkey_cert.erl#L883-L894
  # - fix (OTP-19240, OTP 27.2.2): https://github.com/erlang/otp/commit/e0ef3fbd7e48f8c38c3118335680b2c999ebd96f
  #
  # SUSE ships 27.1.3 without the fix: erlang27 on SLE 15 and erlang on SLE 16.
  # This verify_fun accepts that one error for a CA certificate whose extKeyUsage
  # lists only serverAuth and clientAuth, the purposes the upstream fix exempts for
  # CAs, and passes every other event to hackney's default verify_fun.
  # It applies only to verify: :verify_peer without a caller verify_fun, so
  # verify: :verify_none keeps HTTPoison's accept-all callback, and the hostname
  # check follows a server_name_indication override, as hackney's does.
  # - fixed rule: https://github.com/erlang/otp/blob/OTP-27.2.2/lib/public_key/src/pubkey_cert.erl#L1819-L1835
  # - HTTPoison's verify_none callback: https://github.com/edgurgel/httpoison/blob/v3.0.0/lib/httpoison/base.ex#L819-L828
  # - verify_fun contract: https://github.com/erlang/otp/blob/OTP-27.1.3/lib/ssl/src/ssl.erl#L753-L812
  # - ssl still validates extensions and revocation around the verify_fun:
  #   https://github.com/erlang/otp/blob/OTP-27.1.3/lib/ssl/src/ssl_handshake.erl#L2078-L2161
  # - hackney's default verify_fun (hostname check, expired cross-signed roots):
  #   https://github.com/benoitc/hackney/blob/4.8.4/src/hackney_ssl.erl#L270-L288
  # - caller ssl options replace hackney's defaults key by key:
  #   https://github.com/benoitc/hackney/blob/4.8.4/src/hackney_ssl.erl#L70-L94
  defp verify_fun(url, ssl) do
    with :verify_peer <- ssl[:verify],
         false <- Keyword.has_key?(ssl, :verify_fun),
         host when is_list(host) <- verify_host(url, ssl[:server_name_indication]) do
      {default_fun, state} =
        host
        |> :hackney_ssl.check_hostname_opts()
        |> Keyword.fetch!(:verify_fun)

      [verify_fun: {accept_ca_key_usage_mismatch(default_fun), state}]
    else
      _ -> []
    end
  end

  defp verify_host(_url, sni) when is_list(sni), do: sni

  defp verify_host(url, _sni) do
    case URI.parse(url) do
      %URI{host: host} when is_binary(host) and host != "" -> String.to_charlist(host)
      _ -> nil
    end
  end

  defp accept_ca_key_usage_mismatch(default_fun) do
    fn
      cert, {:bad_cert, {:key_usage_mismatch, {_key_usage, ext_key_usage}}} = event, state ->
        if ca_certificate?(cert) and tls_purposes_only?(ext_key_usage),
          do: {:valid, state},
          else: default_fun.(cert, event, state)

      cert, event, state ->
        default_fun.(cert, event, state)
    end
  end

  defp ca_certificate?(cert) when Record.is_record(cert, :OTPCertificate) do
    match?(
      extension(extnValue: basic_constraints(cA: true)),
      Certificate.extension(cert, :basic_constraints)
    )
  end

  defp ca_certificate?(_), do: false

  defp tls_purposes_only?(extension(extnValue: purposes)) when is_list(purposes) do
    extension(extnValue: tls_purposes) = Extension.ext_key_usage([:serverAuth, :clientAuth])
    Enum.all?(purposes, &(&1 in tls_purposes))
  end

  defp tls_purposes_only?(_), do: false
end

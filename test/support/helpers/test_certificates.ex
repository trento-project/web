# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.Helpers.TestCertificates do
  @moduledoc """
  Generates, with the `openssl` command, the certificate chains used to test
  `Trento.Support.HttpClient` against a real TLS server.

  The chains reproduce the OTP 27.1.3 key usage bug (erlang/otp#9208) and the
  checks that must keep failing around it. Every chain is issued for
  `localhost`, unless its name says otherwise.

  `generate/1` returns a map from chain name to:

    * `:certfile` - the served chain (leaf first, then the intermediates)
    * `:keyfile` - the private key of the leaf
    * `:cacerts` - the DER trust anchors a client needs for the chain
  """

  @ca "basicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\n"
  # The trigger of the bug: a CA without digitalSignature whose extKeyUsage is serverAuth
  @ca_with_server_auth @ca <> "extendedKeyUsage=serverAuth\n"
  @issuing_ca "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,digitalSignature,keyCertSign,cRLSign\nextendedKeyUsage=serverAuth\n"
  @leaf "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost\n"
  @leaf_other_host String.replace(@leaf, "DNS:localhost", "DNS:other.example")
  @leaf_bad_key_usage "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,keyCertSign,cRLSign\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost\n"
  @inter_no_basic_constraints "keyUsage=critical,keyCertSign,cRLSign\n"

  # erlang/otp#8806: an intermediate CA with a critical extKeyUsage
  @ica_8806 "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=digitalSignature,cRLSign,keyCertSign\nextendedKeyUsage=OCSPSigning,serverAuth,clientAuth\n"
  @ica_8806_critical_eku String.replace(
                           @ica_8806,
                           "extendedKeyUsage=",
                           "extendedKeyUsage=critical,"
                         )
  @ica_8806_bug "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=cRLSign,keyCertSign\nextendedKeyUsage=critical,serverAuth,clientAuth\n"
  @ica_8806_bug_ocsp "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=cRLSign,keyCertSign\nextendedKeyUsage=critical,OCSPSigning,serverAuth,clientAuth\n"
  @leaf_8806 "basicConstraints=critical,CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment,nonRepudiation,keyAgreement\nextendedKeyUsage=serverAuth,clientAuth\nsubjectAltName=DNS:localhost\n"
  @leaf_8806_other_host String.replace(@leaf_8806, "DNS:localhost", "DNS:other.example")

  # name, common name, extensions, issuer (nil: self-signed). Issuers come first.
  @certificates [
    # A chain like Let's Encrypt's Gen Y: leaf -> issuing CA -> cross-signed root
    {"anchor-x1", "Example Root X1", @ca, nil},
    {"cross-y", "Example Root Y", @ca_with_server_auth, "anchor-x1"},
    {"issuer-y1", "Example Y1", @issuing_ca, "cross-y"},
    {"leaf-geny", "localhost", @leaf, "issuer-y1"},
    # Single-root chains
    {"root-a", "Example Root A", @ca, nil},
    {"leaf-ok", "localhost", @leaf, "root-a"},
    {"leaf-other-host", "other.example", @leaf_other_host, "root-a"},
    {"leaf-bad-key-usage", "localhost", @leaf_bad_key_usage, "root-a"},
    {"inter-bug", "Example Bug Intermediate", @ca_with_server_auth, "root-a"},
    {"leaf-under-bug", "localhost", @leaf, "inter-bug"},
    {"inter-no-bc", "Example Intermediate without basicConstraints", @inter_no_basic_constraints,
     "root-a"},
    {"leaf-under-no-bc", "localhost", @leaf, "inter-no-bc"},
    {"anchor-bug", "Example Bug Anchor", @ca_with_server_auth, nil},
    {"leaf-under-anchor", "localhost", @leaf, "anchor-bug"},
    {"leaf-self-signed", "localhost", @leaf, nil},
    # erlang/otp#8806 chains
    {"ica-8806-good", "Example ICA 8806 good", @ica_8806, "root-a"},
    {"leaf-8806-good", "localhost", @leaf_8806, "ica-8806-good"},
    {"ica-8806-bad", "Example ICA 8806 bad", @ica_8806_critical_eku, "root-a"},
    {"leaf-8806-bad", "localhost", @leaf_8806, "ica-8806-bad"},
    {"ica-8806-bug", "Example ICA 8806 bug", @ica_8806_bug, "root-a"},
    {"leaf-8806-bug", "localhost", @leaf_8806, "ica-8806-bug"},
    {"leaf-8806-bug-other-host", "other.example", @leaf_8806_other_host, "ica-8806-bug"},
    {"ica-8806-bug-ocsp", "Example ICA 8806 bug OCSP", @ica_8806_bug_ocsp, "root-a"},
    {"leaf-8806-bug-ocsp", "localhost", @leaf_8806, "ica-8806-bug-ocsp"}
  ]

  # Expired leaves: `openssl ca` sets past validity dates on every OpenSSL and
  # LibreSSL version, `openssl x509 -not_before` needs OpenSSL 3.4.
  @expired [
    {"leaf-expired", @leaf, "root-a"},
    {"leaf-8806-bug-expired", @leaf_8806, "ica-8806-bug"}
  ]

  # chain name -> [leaf | intermediates], trust anchor
  @chains %{
    "valid" => {["leaf-ok"], "root-a"},
    "other-host" => {["leaf-other-host"], "root-a"},
    "untrusted-root" => {["leaf-ok"], "anchor-x1"},
    "leaf-bad-key-usage" => {["leaf-bad-key-usage"], "root-a"},
    "intermediate-bug" => {["leaf-under-bug", "inter-bug"], "root-a"},
    "intermediate-no-basic-constraints" => {["leaf-under-no-bc", "inter-no-bc"], "root-a"},
    "anchor-bug" => {["leaf-under-anchor"], "anchor-bug"},
    "self-signed" => {["leaf-self-signed"], "root-a"},
    "expired" => {["leaf-expired"], "root-a"},
    "gen-y" => {["leaf-geny", "issuer-y1", "cross-y"], "anchor-x1"},
    "8806-good" => {["leaf-8806-good", "ica-8806-good"], "root-a"},
    "8806-bad" => {["leaf-8806-bad", "ica-8806-bad"], "root-a"},
    "8806-bug" => {["leaf-8806-bug", "ica-8806-bug"], "root-a"},
    "8806-bug-ocsp" => {["leaf-8806-bug-ocsp", "ica-8806-bug-ocsp"], "root-a"},
    "8806-bug-other-host" => {["leaf-8806-bug-other-host", "ica-8806-bug"], "root-a"},
    "8806-bug-expired" => {["leaf-8806-bug-expired", "ica-8806-bug"], "root-a"}
  }

  @spec generate(Path.t()) :: %{String.t() => map()}
  def generate(dir) do
    File.mkdir_p!(dir)

    names = Enum.map(@certificates, &elem(&1, 0)) ++ Enum.map(@expired, &elem(&1, 0))

    names
    |> Task.async_stream(&openssl!(dir, ["genrsa", "-out", "#{&1}.key", "2048"]),
      timeout: 60_000
    )
    |> Stream.run()

    Enum.each(@certificates, fn {name, cn, extensions, issuer} ->
      certificate!(dir, name, cn, extensions, issuer)
    end)

    Enum.each(@expired, fn {name, extensions, issuer} ->
      expired_certificate!(dir, name, extensions, issuer)
    end)

    Map.new(@chains, fn {chain, {[leaf | _] = served, anchor}} ->
      certfile = Path.join(dir, "served-#{chain}.pem")
      File.write!(certfile, Enum.map(served, &File.read!(Path.join(dir, "#{&1}.pem"))))

      {chain,
       %{
         certfile: certfile,
         keyfile: Path.join(dir, "#{leaf}.key"),
         cacerts: ders(Path.join(dir, "#{anchor}.pem"))
       }}
    end)
  end

  defp certificate!(dir, name, cn, extensions, issuer) do
    File.write!(Path.join(dir, "#{name}.ext"), extensions)
    csr!(dir, name, cn)

    signer =
      case issuer do
        nil -> ["-signkey", "#{name}.key"]
        issuer -> ["-CA", "#{issuer}.pem", "-CAkey", "#{issuer}.key", "-CAcreateserial"]
      end

    openssl!(
      dir,
      ["x509", "-req", "-in", "#{name}.csr", "-days", "365", "-sha256"] ++
        signer ++ ["-extfile", "#{name}.ext", "-out", "#{name}.pem"]
    )
  end

  defp expired_certificate!(dir, name, extensions, issuer) do
    ca_dir = Path.join(dir, "ca-#{name}")
    File.mkdir_p!(ca_dir)
    File.write!(Path.join(ca_dir, "index.txt"), "")
    File.write!(Path.join(ca_dir, "serial"), "01\n")

    File.write!(Path.join(ca_dir, "ca.cnf"), """
    [ca]
    default_ca = test_ca
    [test_ca]
    database = #{ca_dir}/index.txt
    new_certs_dir = #{ca_dir}
    serial = #{ca_dir}/serial
    default_md = sha256
    policy = policy_any
    unique_subject = no
    [policy_any]
    commonName = supplied
    """)

    File.write!(Path.join(dir, "#{name}.ext"), extensions)
    csr!(dir, name, "localhost")

    openssl!(dir, [
      "ca",
      "-batch",
      "-notext",
      "-config",
      Path.join(ca_dir, "ca.cnf"),
      "-cert",
      "#{issuer}.pem",
      "-keyfile",
      "#{issuer}.key",
      "-in",
      "#{name}.csr",
      "-startdate",
      "200101000000Z",
      "-enddate",
      "200201000000Z",
      "-extfile",
      "#{name}.ext",
      "-out",
      "#{name}.pem"
    ])
  end

  defp csr!(dir, name, cn),
    do:
      openssl!(dir, [
        "req",
        "-new",
        "-key",
        "#{name}.key",
        "-subj",
        "/CN=#{cn}",
        "-out",
        "#{name}.csr"
      ])

  defp openssl!(dir, args) do
    case System.cmd("openssl", args, cd: dir, stderr_to_stdout: true) do
      {_, 0} -> :ok
      {output, status} -> raise "openssl #{Enum.join(args, " ")} failed (#{status}): #{output}"
    end
  end

  defp ders(file) do
    file
    |> File.read!()
    |> :public_key.pem_decode()
    |> Enum.map(fn {:Certificate, der, _} -> der end)
  end
end

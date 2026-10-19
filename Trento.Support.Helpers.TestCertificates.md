# `Trento.Support.Helpers.TestCertificates`
[🔗](https://github.com/trento-project/web/blob/main/test/support/helpers/test_certificates.ex#L4)

Generates, with the `openssl` command, the certificate chains used to test
`Trento.Support.HttpClient` against a real TLS server.

The chains reproduce the OTP 27.1.3 key usage bug (erlang/otp#9208) and the
checks that must keep failing around it. Every chain is issued for
`localhost`, unless its name says otherwise.

`generate/1` returns a map from chain name to:

  * `:certfile` - the served chain (leaf first, then the intermediates)
  * `:keyfile` - the private key of the leaf
  * `:cacerts` - the DER trust anchors a client needs for the chain

# `generate`

```elixir
@spec generate(Path.t()) :: %{required(String.t()) =&gt; map()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*

# `Trento.Support.Helpers.TlsTestServer`
[🔗](https://github.com/trento-project/web/blob/main/test/support/helpers/tls_test_server.ex#L4)

A minimal HTTPS server for tests: it listens on 127.0.0.1 on a random port,
serves the given certificate chain and answers every request with
`200 ok`. A client that rejects the chain fails the handshake, the server
ignores that and accepts the next connection.

    server = start_supervised!({TlsTestServer, certfile: certfile, keyfile: keyfile})
    port = TlsTestServer.port(server)

# `child_spec`

Returns a specification to start this module under a supervisor.

See `Supervisor`.

# `port`

# `start_link`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

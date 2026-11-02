# `TrentoWeb.Auth.FakeIdentityProvider`
[🔗](https://github.com/trento-project/web/blob/main/test/support/auth/fake_identity_provider.ex#L4)

Assent HTTP adapter faking an OAuth2/OIDC identity provider.

- `https://provider.example.com` issues a token for any code but `expired`,
  which it rejects with `invalid_grant`, and returns the `sso_user` claims
- `https://unreachable.example.com` fails as a provider that is down

---

*Consult [api-reference.md](api-reference.md) for complete listing*

# `TrentoWeb.OpenApi.V1.Schema.Auth.ExternalIdpCallback`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L135)

Schema for external identity provider callback requests.

This schema defines the structure for OAuth2/OIDC authentication flow callbacks,
handling the authorization code and session state returned from external identity providers.

## Fields
- `code`: Authorization code returned from the identity provider after user consent
- `session_state`: Session state parameter for additional security and session management

## Authentication Flow
1. User is redirected to external IDP for authentication
2. After successful authentication, user is redirected back with authorization code
3. This schema validates the callback parameters
4. Authorization code is exchanged for access tokens

## Security Notes
- Authorization codes are single-use and have short validity periods
- Session state helps prevent CSRF attacks
- All parameters should be validated against the original request

# `schema`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

# `TrentoWeb.OpenApi.V1.Schema.Auth.RefreshedCredentials`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L314)

Schema for refreshed authentication results.

This schema defines the structure for responses when using a refresh token to obtain
new access credentials, enabling seamless session extension without re-authentication.

## Fields
- `access_token`: New JWT access token for authenticating API requests
- `expires_in`: Token lifetime in seconds for session management

## Token Refresh Flow
1. Client detects access token expiration or proactively refreshes
2. Client sends valid refresh token to refresh endpoint
3. Server validates refresh token and issues new access token
4. Client receives new credentials and updates stored tokens

## Security Notes
- Refresh tokens remain valid and should be stored securely
- New access token has updated expiration time
- Failed refresh requires full re-authentication
- Consider token rotation strategies for enhanced security

# `schema`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

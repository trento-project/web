# `TrentoWeb.OpenApi.V1.Schema.Auth.Credentials`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L248)

Schema for successful authentication responses.

This schema defines the structure for successful authentication responses containing
access and refresh tokens with expiration information for session management.

## Fields
- `access_token`: JWT token for authenticating API requests (short-lived)
- `refresh_token`: JWT token for obtaining new access tokens (long-lived)
- `expires_in`: Token lifetime in seconds for session management

## Token Management
- Access tokens should be used for all authenticated API requests
- When access token expires, use refresh token to obtain new credentials
- Store tokens securely and transmit only over HTTPS
- Implement proper token rotation for security

## Security Best Practices
- Access tokens have shorter validity periods for security
- Refresh tokens enable seamless session extension
- Both tokens use JWT format with proper signing and encryption

# `schema`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

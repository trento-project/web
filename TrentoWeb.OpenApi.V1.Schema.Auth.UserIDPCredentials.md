# `TrentoWeb.OpenApi.V1.Schema.Auth.UserIDPCredentials`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L190)

Schema for successful IDP authentication responses.

This schema defines the structure for successful IDP authentication responses containing
access and refresh tokens with expiration information for session management.

## Fields
- `access_token`: JWT token for authenticating API requests (short-lived)
- `refresh_token`: JWT token for obtaining new access tokens (long-lived)

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

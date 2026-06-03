# `TrentoWeb.OpenApi.V1.Schema.Auth.RefreshTokenRequest`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L93)

Schema for refresh token requests.

This schema defines the structure for requests to obtain new access tokens
using a valid refresh token, enabling session extension without re-authentication.

## Fields
- `refresh_token`: A valid JWT refresh token obtained from previous authentication

## Security Notes
- Refresh tokens have longer validity periods than access tokens
- They should be stored securely and transmitted over HTTPS only
- Invalid or expired refresh tokens will result in authentication errors

# `schema`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

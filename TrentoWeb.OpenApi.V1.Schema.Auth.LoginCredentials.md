# `TrentoWeb.OpenApi.V1.Schema.Auth.LoginCredentials`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L35)

This schema defines the structure for authentication requests containing username,
password, and optional TOTP code for secure login to the Trento platform.

## Fields
- `username`: The user's unique identifier for authentication (required)
- `password`: The user's secret password for authentication (required)
- `totp_code`: Time-based One-Time Password code, required when TOTP is enabled (optional)

## Security Notes
- Password field should never be logged or exposed in responses
- TOTP code is time-sensitive and should be validated immediately
- All fields are validated against appropriate security constraints

# `schema`

---

*Consult [api-reference.md](api-reference.md) for complete listing*

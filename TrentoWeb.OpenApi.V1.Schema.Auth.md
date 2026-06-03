# `TrentoWeb.OpenApi.V1.Schema.Auth`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/v1/schema/auth.ex#L4)

Authentication and Authorization Schemas for Trento Web API

This module contains all OpenAPI schemas related to authentication, authorization,
and session management in the Trento platform. It provides comprehensive validation
and documentation for all credential-related API endpoints.

## Overview
The schemas in this module support various authentication flows:
- Username/password authentication with optional TOTP
- Token refresh mechanisms for session management
- External identity provider integration (OAuth2, OIDC, SAML)
- Federated authentication and single sign-on (SSO)

## Schema Categories
- **Request Schemas**: Validate incoming authentication requests
- **Response Schemas**: Define successful authentication responses
- **Token Schemas**: Handle JWT token structures and validation
- **External IDP Schemas**: Support federated authentication flows

## Security Considerations
All schemas include appropriate validation constraints, security annotations,
and follow best practices for authentication system design. Sensitive fields
like passwords are properly marked and should never be logged or exposed.

## Usage
These schemas are used by OpenAPI specification generation and request/response
validation in the Trento Web API controllers, particularly the SessionController.

---

*Consult [api-reference.md](api-reference.md) for complete listing*

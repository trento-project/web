defmodule TrentoWeb.OpenApi.V1.Schema.Auth do
  @moduledoc """
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
  """

  defmodule LoginCredentials do
    @moduledoc """
    Schema for user login credentials.

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
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "LoginCredentials",
        type: :object,
        additionalProperties: false,
        example: %{
          username: "admin",
          password: "thepassword"
        },
        properties: %{
          username: %OpenApiSpex.Schema{
            type: :string
          },
          password: %OpenApiSpex.Schema{
            type: :string
          },
          totp_code: %OpenApiSpex.Schema{
            type: :string
          }
        }
      },
      struct?: false
    )
  end

  defmodule RefreshTokenRequest do
    @moduledoc """
    Schema for refresh token requests.

    This schema defines the structure for requests to obtain new access tokens
    using a valid refresh token, enabling session extension without re-authentication.

    ## Fields
    - `refresh_token`: A valid JWT refresh token obtained from previous authentication

    ## Security Notes
    - Refresh tokens have longer validity periods than access tokens
    - They should be stored securely and transmitted over HTTPS only
    - Invalid or expired refresh tokens will result in authentication errors
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "Refresh Credentials",
        type: :object,
        example: %{
          refresh_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
        },
        properties: %{
          refresh_token: %OpenApiSpex.Schema{
            type: :string
          }
        }
      },
      struct?: false
    )
  end

  defmodule ExternalIdpCallback do
    @moduledoc """
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
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "UserIDPEnrollmentCredentials",
        type: :object,
        example: %{
          code: "kyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYt",
          session_sate: "frHteBttgtW8706m7nqYC6ruYt"
        },
        properties: %{
          code: %OpenApiSpex.Schema{
            type: :string
          },
          session_state: %OpenApiSpex.Schema{
            type: :string
          }
        },
        required: [:code, :session_state]
      },
      struct?: false
    )
  end

  defmodule UserIDPCredentials do
    @moduledoc """
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
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "UserIDPCredentials",
        type: :object,
        example: %{
          access_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A",
          refresh_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
        },
        properties: %{
          access_token: %OpenApiSpex.Schema{
            type: :string
          },
          refresh_token: %OpenApiSpex.Schema{
            type: :string
          }
        }
      },
      struct?: false
    )
  end

  defmodule Credentials do
    @moduledoc """
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
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "Credentials",
        type: :object,
        example: %{
          expires_in: 600,
          access_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A",
          refresh_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
        },
        properties: %{
          access_token: %OpenApiSpex.Schema{
            type: :string
          },
          refresh_token: %OpenApiSpex.Schema{
            type: :string
          },
          expires_in: %OpenApiSpex.Schema{
            type: :integer
          }
        }
      },
      struct?: false
    )
  end

  defmodule RefreshedCredentials do
    @moduledoc """
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
    """

    require OpenApiSpex

    OpenApiSpex.schema(
      %{
        title: "RefreshedCredentials",
        type: :object,
        example: %{
          expires_in: 600,
          access_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJ1c2VyX2lkIjoxfQ.frHteBttgtW8706m7nqYC6ruYtTrbVcCEO_UgIkHn6A"
        },
        properties: %{
          access_token: %OpenApiSpex.Schema{
            type: :string
          },
          expires_in: %OpenApiSpex.Schema{
            type: :integer
          }
        }
      },
      struct?: false
    )
  end
end

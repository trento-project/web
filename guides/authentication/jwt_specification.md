# JWT

The `web` dashboard is the identity provider and authentication manager of the Trento stack.
The API endpoints of the Trento project are protected with a JWT token authentication.

To retrieve and refresh an access token, you should always refer to the web dashboard, with dedicated endpoints.

## Login

Endpoint: `/api/session`
Method: POST
Content-Type: `application/json`

Body

```json
{
    "username": "yourusername",
    "password": "yourpassword"
}
```

Returns 401 if the credentials are invalid.

**Curl Example**

```bash
curl 'http://<YOUR_TRENTO_INSTANCE>/api/session' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{"username":"your_username","password":"your_password"}' \
```

The login endpoint returns a pair of JWT tokens, an `access_token`, used as `Bearer` token for all the API requests, and a `refresh_token` used to regenerate an `access_token` when the token expires.

### JWT anatomy

**Access token**

```json
{
    "aud": "trento-project",
    "exp": 1673882986,
    "iat": 1673882386,
    "iss": "https://github.com/trento-project/web",
    "jti": "2std6abj9nni0s3kp8000lv2",
    "nbf": 1673882386,
    "sub": 1,
    "typ": "Bearer"
}
```

**Refresh Token**

```json
{
  "aud": "trento-project",
  "exp": 1673886911,
  "iat": 1673865311,
  "iss": "https://github.com/trento-project/web",
  "jti": "2stc78e75h9sgvrc9s0003f2",
  "nbf": 1673865311,
  "sub": 1,
  "typ": "Refresh"
}
```

You can distinguish the `access_token` from the `refresh_token` using the claim `typ` of the JWT.

The `access_token` has a lifespan of **10 minutes**, the `refresh_token` has a lifespan of **6 hours**.

The `sub` claim, contains the identifier of the user, in the example JWT `1`.

## Refresh an access token

To refresh an `access_token` when expires, you should use the `refresh` endpoint.

Endpoint: `/api/session/refresh`
Method: POST
Content-Type: `application/json`

Body

```json
{
    "refresh_token": "YOUREFRESHTOKENJWT",
}
```

Returns 401 if the refresh token is invalid or expired.

**Curl Example**

```bash
curl 'http://<YOUR_TRENTO_INSTANCE>/api/session/refresh' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{"refresh_token":"YOUR_REFRESH_TOKEN"}' \
```

The endpoint will return a new `access_token` with the same lifespan as all the other `access_token`.

Please refer to the [OpenAPI](https://www.trento-project.io/web/swaggerui/#/Platform/TrentoWeb.SessionController.create) spec for further details and client generation.

# OAuth 2.0

Trento integrates with an identity provider (IDP) that use the OAuth 2.0 (OAuth2) protocol to authenticate users accessing the console. Authorization for specific abilities/permissions is managed by Trento, which means that only basic user information is retrieved from the external IDP.

## Enabling OAuth2

The OAuth2 authentication is **disabled by default**.

Provide the following environment variables to enable OAuth2 feature when starting Trento.

```
# Required:
ENABLE_OAUTH2=true
OAUTH2_CLIENT_ID=<<OAUTH2_CLIENT_ID>>
OAUTH2_CLIENT_SECRET=<<OAUTH2_CLIENT_SECRET>>
OAUTH2_BASE_URL=<<OAUTH2_BASE_URL>>
OAUTH2_AUTHORIZE_URL=<<OAUTH2_AUTHORIZE_URL>>
OAUTH2_TOKEN_URL=<<OAUTH2_TOKEN_URL>>
OAUTH2_USER_URL=<<OAUTH2_USER_URL>>

# Optional:
OAUTH2_SCOPES=<<OAUTH2_SCOPES>>
OAUTH2_CALLBACK_URL=<<OAUTH2_CALLBACK_URL>>
```

## Enabling OAuth2 in Development

Enable OAuth2 in the development environment using Docker and [Keycloak](https://github.com/keycloak/keycloak) as IDP.

### Starting Keycloak Identity Provider

Use a custom Docker profile to start Keycloak as IDP for local development.

Start the Docker containers with the `idp` profile:

```
docker compose --profile idp up
```

Keycloak server can be accessed at [http://localhost:8081](http://localhost:8081)

### Create OAuth2 configuration

1. Create a new local development configuration `dev.local.exs` in `config` directory.

1. Enable OAuth2 in `dev.local.exs` config:

   ```elixir
   import Config

   config :trento, :oauth2, enabled: true
   ```

1. Start Trento web as usual

   `iex -S mix phx.server`

### Login into Trento web console using Single Sign-on with Keycloak

1. Navigate to the [Trento web console](http://localhost:4000/).

2. Click on `Login with Single Sign-on`:

![trento_single_sign_on_login](https://raw.githubusercontent.com/trento-project/web/main/guides/assets/trento_single_sign_on_login.png)

You will be redirected to the Keycloak login page:
![keycloack_login](https://raw.githubusercontent.com/trento-project/web/main/guides/assets/keycloack_login.png)

### Login as Trento user through keycloak IDP

The default Trento login credentials are:

Username:

```
trentoidp
```

Password:

```
password
```

After successfully entering user login data, the user is redirected to Trento web console.

### Login into the Keycloak Admin Console

Username:

```
keycloak
```

Password:

```
admin
```

### Assigning Admin Rights to the Trento User

Grant admin rights to the `trentoidp` user, update the `config/dev.local.exs` file as follows , then restart the application

```
import Config

config :trento, :oauth2, enabled: true

config :trento,
  admin_user: "trentoidp"
```

### Run OAuth2 integration E2E tests

Running OAuth2 e2e tests, requires a running IDP provider.

Run docker compose with the `--profile idp` flag, to use our [Keycloak](https://github.com/keycloak/keycloak) deployment for testing.

# OIDC

  The OIDC feature enables Users to authenticate with Trento by using an idp provider.

## Enabling OIDC

  OIDC feature is disabled by default.

  Enable OIDC feature by providing the following environment variable when starting Trento:

  ```
  ENABLE_OIDC=true
  OIDC_CLIENT_ID=<<OIDC_CLIENT_ID>>
  OIDC_CLIENT_SECRET=<<OIDC_CLIENT_SECRET>>
  OIDC_BASE_URL=<<OIDC_BASE_URL>>
  OIDC_CALLBACK_URL=<<OIDC_CALLBACK_URL>>
  ```

## Enabling OIDC in development?

### Enable OIDC in dev environment by editing `config/dev.exs`

  From:
  ```
  config :trento, :oidc,
    enabled: false,
    callback_url: "http://localhost:4000/auth/oidc_callback"
  ```
  To:

  ```
  config :trento, :oidc,
    enabled: true,
    callback_url: "http://localhost:4000/auth/oidc_callback"
  ```

### Start docker-compose with idp profile

  Enable [keycloak](https://github.com/keycloak/keycloak) which is used as custom idp:
  ```
  docker-compose --profile idp up
  ```

### Start Trento Web server in the REPL

  ```
  iex -S mix phx.server
  ```

### Access the Trento Web or Keycloak

  Access the Trento Web by navigating to http://localhost:4000 in the web browser.
  Access the Keycloak server by navigating to http://localhost:8081 in the web browser.

### Login into Trento web console by using Single Sign-on with Keycloak

  Click on `Login with Single Sign-on`:

  ![LoginView](loginView.png)

  After clicking on the button the user is redirected to the local keycloak instance.
  ![KeycloakLoginView](keycloakView.png)

### Login as Trento user through keycloak idp

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

### Login as admin in keycloak?

  Username:

  ```
  keycloak
  ```

  Password:

  ```
  admin
  ```

### How to make the trentoidp user admin? 

  Change the configuration in `config/dev.exs` to and restart the application

  ```
  config :trento,
    admin_user: "trentoidp"

  config :trento, :oidc,
    enabled: true,
    callback_url: "http://localhost:4000/auth/oidc_callback"
  ```
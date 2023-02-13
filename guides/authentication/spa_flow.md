# Trento Single Page Application

The trento single page application, leverages the JWT authentication mechanism of `trento` API, using the refresh token flow when the `access_token` expires.

## Login Diagram

![Login diagram](../assets/trento-spa-login.png)

## Refresh Token Success Diagram

![Refresh token success diagram](../assets/trento-spa-refresh.png)

## Refresh Token Failure Diagram

![Refresh token failure diagram](../assets/trento-spa-refresh-failed.png)


All the login/logout procedures are handled by the `SPA` using route guards and authentication providers hooked into the network calls.


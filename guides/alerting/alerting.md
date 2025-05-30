# Alerting

The Alerting feature notifies the SAP Administrator about important events detected in the Landscape being monitored/observed by Trento.

Some of the notified events:
- **Host Health detected critical**
- **Cluster Health detected critical**
- **Database Health detected critical**
- **SAP System Health detected critical**
- ...

## Enabling Alerting

This feature is **disabled by default**.

There are two ways to enable and configure SMTP alerting:

- via Environment Variables (env-vars)
- via WebUI/RESTful API

The env-vars have precedence. If _any_ of the following env-vars is
set, then alerting configuration is _only_ made via env-vars:
`ENABLE_ALERTING`, `ALERTING_SENDER`, `ALERTING_RECIPIENT`,
`SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`. Trento
provides default values for the env-vars that are not explicitly
set. To quickly enable alerting, provide `ENABLE_ALERTING=true` as an
environment variable when starting Trento.

Example configuration:
```
ENABLE_ALERTING=true
ALERT_SENDER=sender@yourmail.com
ALERT_RECIPIENT=recipient@yourmail.com

SMTP_SERVER=your.smtp-server.com
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASSWORD=password
```

The other way of configuring alerting is via the Web interface or
through the API. To be able to use this variant, _all_ of the
aforementioned env-vars should be left undefined when starting
Trento. Then, configuring the alerting values could be done in a
self-explanatory manner from Settings menu in Trento web
console. There is also an OpenAPI spec for the API.

Currently **SMTP** is the **only supported delivery mechanism** for
alert notifications.

## Enabling Alerting at a later stage

If no env-vars are in place, then you can freely change alerting
configuration via WebUI and/or RESTful API at any time without needing
to restart.

If your current Trento installation has alerting env-vars in-place,
then in order to change them you have to restart Trento with the new
values. If using Helm, for example, you can change alerting env-vars
by upgrading the deployment:

```
helm upgrade
   --install <THE_DEPLOYMENT>
   --set trento-web.adminUser.password=<ADMIN_PASSWORD>
   --set-file trento-runner.privateKey=<PRIVATE_SSH_KEY>
   --set trento-web.alerting.enabled=true
   --set trento-web.alerting.smtpServer=<SMTP_SERVER>
   --set trento-web.alerting.smtpPort=<SMTP_PORT>
   --set trento-web.alerting.smtpUser=<SMTP_USER>
   --set trento-web.alerting.smtpPassword=<SMTP_PASSWORD>
   --set trento-web.alerting.sender=<ALERT_SENDER>
   --set trento-web.alerting.recipient=<ALERT_RECIPIENT>
```

## Local development and testing

Our `docker-compose.yaml` file contains a profile providing a Mailpit
SMTP server. You can make use of it with the following snippet:

```
docker compose --profile smtp up -d
```

Mailpit has great web UI that can be accessed on `localhost:8025`.

Since we need to support several scenarios with SMTP servers, our
compose file is parameterized with several trento-specific
environment variables:

- `TRENTO_SMTP_AUTHENTICATED` -- By setting it to non-empty,
  configures Mailpit to require authentication from its clients.
- `TRENTO_SMTP_INSECURE` -- By setting it to non-empty, allows to run
  Mailpit server requiring authentication over insecure channel
  (eg. sending passwords in plain text). This is very useful for local
  development without need to setup TLS.

By default, the Mailpit SMTP server runs without need for
authentication over unecnrypted channel.

TBD: Add STARTTLS/TLS configuration.

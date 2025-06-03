# Alerting

The Alerting feature notifies the SAP Administrator about important
events detected in the Landscape being monitored/observed by Trento.

Some of the notified events:
- **Host Health detected critical**
- **Cluster Health detected critical**
- **Database Health detected critical**
- **SAP System Health detected critical**
- ...

## Enabling Alerting

This feature is **disabled by default**.

There are two ways to enable and configure SMTP alerting:

### Configure Alerting with Environment Variables

The following OS environment variables could be set before
starting Trento:

| Env-var              | Description                                                     |
| ---                  | ---                                                             |
| `ENABLE_ALERTING`    | Enables sending alerting e-mails when set to `true`             |
| `ALERT_SENDER`       | The e-mail address that would be used as sender                 |
| `ALERT_RECIPIENT`    | The e-mail address of the receiving entity                      |
| `SMTP_SERVER`        | Domain name of the SMTP server that would handle the submission |
| `SMTP_PORT`          | The port SMTP server listens on for new submissions             |
| `SMTP_USER    `      | Username used for authentication, if required                   |
| `SMTP_PASSWORD`      | Password used for authentication, if required                   |

Trento provides default values for the environment variables that are
not explicitly set.

To quickly enable alerting, provide `ENABLE_ALERTING=true` as an
environment variable when starting Trento.

### Configure Alerting by using WebUI/RESTful API

Configuring the alerting values could be done in a self-explanatory
manner from Settings menu in Trento web console.

Additionally, Trento supports changing these settings by the Web API
for which OpenAPI specification is available.

Both of these methods modify alerting in real-time without needing a
restart.

### Priority of Configuration Methods

Environment variables have precedence. If _any_ of the previously
mentioned environment variables is set, configuration via environment
variables takes full precedence, and the WebUI/API method is disabled.

### Example configuration

```
ENABLE_ALERTING=true
ALERT_SENDER=sender@yourmail.com
ALERT_RECIPIENT=recipient@yourmail.com

SMTP_SERVER=your.smtp-server.com
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASSWORD=password
```

> [!Note]
> Currently **SMTP** is the **only supported delivery mechanism** for
> alert notifications.

## Enabling Alerting at a later stage

If no alerting-related environment variables are set, modify the
alerting configuration through the WebUI or RESTful API — without
restarting Trento.

If the Trento deployment uses alerting environment variables, any
changes require a restart of the service.

### Example: Updating Alerting Environment Variables with Helm:

If helm is used, update alerting-related env-vars by upgrading the
deployment:

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

The provided `docker-compose.yaml` file includes a
[Mailpit](https://github.com/axllent/mailpit) SMTP server for local
testing during development.

Access Mailpit’s web interface at: http://localhost:8025/

### Configuration Options

The Docker Compose setup supports multiple SMTP scenarios using the
following Trento-specific environment variables:

- `TRENTO_SMTP_AUTHENTICATED` -- By setting it to non-empty,
  configures Mailpit to require authentication from its clients.
- `TRENTO_SMTP_INSECURE` -- By setting it to non-empty, allows to run
  Mailpit server requiring authentication over insecure channel
  (eg. sending passwords in plain text). This is very useful for local
  development without need to setup TLS.

By default, the Mailpit SMTP server runs without need for
authentication over an unencrypted channel.

> [!IMPORTANT]
> *TBD*: Add STARTTLS/TLS configuration.

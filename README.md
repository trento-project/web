# Trento

An open cloud-native web console improving on the work day of SAP Applications administrators.

# Table of contents

- [Trento](#trento)
- [Table of contents](#table-of-contents)
- [Features](#features)
  - [Alerting](#alerting)
    - [Enabling Alerting](#enabling-alerting)
    - [Delivery and Recipient](#delivery-and-recipient)
- [Hack on the trento](#hack-on-the-trento)
  - [Install dependencies](#install-dependencies)
  - [Development environment](#development-environment)
  - [Setup trento](#setup-trento)
  - [Start trento in the repl](#start-trento-in-the-repl)
  - [Scenario loading with photofinish](#scenario-loading-with-photofinish)

# Features

## Alerting
Alerting feature notifies the SAP Administrator about important updated in the Landscape being monitored/observed by Trento.

Some of the notified events:
- **Host heartbeat failed**
- **Cluster Health detected critical**
- **Database Health detected critical**
- **SAP System Health detected critical**
- ...

The feature is **disabled by default**.
### Enabling Alerting
Provide `ENABLE_ALERTING=true` as an environment variable when starting Trento.
### Delivery and Recipient
A notification needs to be _delivered to someone_ in _some way_.

With alerting enabled some extra configuration is needed to define the recipient and the delivery mechanism.

Currently **SMTP** is the **only supported delivery mechanism** for notification.

```
ALERT_RECIPIENT=recipient@yourmail.com
SMTP_SERVER=your.smtp-server.com
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASSWORD=password
```

### Enabling Alerting at a later stage
If your current Trento installation has Alerting disabled, you can enable it by... (TBD)

# Hack on the trento

## Install dependencies

```
$> mix deps.get
```

## Development environment

A `docker-compose` development environment is provided.

```
$> docker-compose up -d
```

## Setup trento

```
$> mix setup
```

## Start trento in the repl

```
$> iex -S mix phx.server
```

## Scenario loading with photofinish

By leveraging [photofinish](https://github.com/trento-project/photofinish) it is possible to load different scenarios for development and debugging purposes.

```
$> photofinish run --url "http://localhost:4000/api/collect" healthy-27-node-SAP-cluster
```

Several useful scenario fixtures are available in [./test/fixtures/scenarios](./test/fixtures/scenarios/), the same ones used in e2e tests.

See also [.photofinish.toml](./.photofinish.toml).

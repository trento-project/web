# Alerting

Alerting feature notifies the SAP Administrator about important updated in the Landscape being monitored/observed by Trento.

Some of the notified events:
- **Host heartbeat failed**
- **Cluster Health detected critical**
- **Database Health detected critical**
- **SAP System Health detected critical**
- ...

## Enabling Alerting

The feature is **disabled by default**.

Provide `ENABLE_ALERTING=true` as an environment variable when starting Trento.
## Delivery and Recipient
A notification needs to be _delivered to someone_ in _some way_.

With alerting enabled some extra configuration is needed to define the recipient and the delivery mechanism.

Currently **SMTP** is the **only supported delivery mechanism** for notification.

```
ENABLE_ALERTING=true
ALERT_RECIPIENT=recipient@yourmail.com

SMTP_SERVER=your.smtp-server.com
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASSWORD=password
```

## Enabling Alerting at a later stage
If your current Trento installation has Alerting disabled, you can enable it by... (TBD)
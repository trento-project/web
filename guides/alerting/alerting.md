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

Provide `ENABLE_ALERTING=true` as an environment variable when starting Trento.

## Delivery and Recipient
A notification needs to be _delivered to someone_ in _some way_.

With alerting enabled some extra configuration is needed to define the recipient and the delivery mechanism.

Currently **authenticated SMTP** is the **only supported delivery mechanism** for alert notifications.

```
ENABLE_ALERTING=true
ALERT_SENDER=sender@yourmail.com
ALERT_RECIPIENT=recipient@yourmail.com

SMTP_SERVER=your.smtp-server.com
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASSWORD=password
```

## Enabling Alerting at a later stage
If your current Trento installation has Alerting disabled, you can enable it by upgrading the helm deployment.

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

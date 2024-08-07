# Environment Variables

A possibly non comprehensive list of the environment variables needed by the control plane to work.

Dig into [./config](https://github.com/trento-project/web/blob/main/config/) directory for mode details.

---

**Persistence**
- `DATABASE_URL`
- `DATABASE_POOL_SIZE`
- `EVENTSTORE_URL`
- `EVENTSTORE_POOL_SIZE`

**Basic encryption**
- `SECRET_KEY_BASE`

**Server**
- `PORT`
- `TRENTO_WEB_ORIGIN`

**Runner integration**
- `RUNNER_URL`

**Monitoring**
- `PROMETHEUS_URL`
- `CHARTS_ENABLED`

**Alerting**
- `ENABLE_ALERTING`
- `ALERT_RECIPIENT`

**SMTP**
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

**AUTHENTICATION**
- `ACCESS_TOKEN_ENC_SECRET`
- `REFRESH_TOKEN_ENC_SECRET`

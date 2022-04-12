# Environment Variables

A possibly non comprehensive list of the environment variables needed by the control plane to work.

Dig into [./config](../../config/) directory for mode details.

---

**Installation**
- `FLAVOR`

**Persistence**
- `DATABASE_URL`
- `DATABASE_POOL_SIZE`
- `EVENTSTORE_URL`
- `EVENTSTORE_POOL_SIZE`

**Basic encryption**
- `SECRET_KEY_BASE`

**Server**
- `PORT`

**Runner integration**
- `RUNNER_URL`

**Monitoring**
- `GRAFANA_USER`
- `GRAFANA_PASSWORD`
- `GRAFANA_PUBLIC_URL`
- `GRAFANA_API_URL`

**Alerting**
- `ENABLE_ALERTING`
- `ALERT_RECIPIENT`

**SMTP**
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
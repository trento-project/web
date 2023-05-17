# Monitoring

Currently Trento provides a basic integration with [Prometheus](https://github.com/prometheus/prometheus) and [Grafana](https://github.com/grafana/grafana) that gives realtime information of the following metrics:

- Host CPU usage
- Host Memory usage

Current integration strategy: Grafana Charts embedded in Trento UI (_Host Details_).

In order for monitoring to properly work here's the required environment variables
- `GRAFANA_PUBLIC_URL` -> publicly accessible grafana url, the one embedded in iframes
- `GRAFANA_API_URL` -> grafana API endpoint for dashboard initialization
- `GRAFANA_USER` -> user allowed to perform operations on grafana 
- `GRAFANA_PASSWORD` -> well, the password

On a full Trento installation monitoring is enabled by default and the configuration is handled by the helm-charts.

---

![Monitoring Architecture](https://raw.githubusercontent.com/trento-project/web/main/guides/assets/trento-monitoring.png)
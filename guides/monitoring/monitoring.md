# Monitoring

Currently Trento provides a basic integration with [Prometheus](https://github.com/prometheus/prometheus) that gives realtime information of the following metrics:

- Host CPU usage
- Host Memory usage

Current integration strategy: Custom charts Trento UI (_Host Details_).

In order for monitoring to properly work here's the required environment variables
- `PROMETHEUS_URL` -> prometheus URL, should be accessible from the web backend, it's not mandatory to expose on the internet.

On a full Trento installation monitoring is enabled by default and the configuration is handled by the helm-charts.

---

![Monitoring Architecture](https://raw.githubusercontent.com/trento-project/web/main/guides/assets/trento-monitoring.png)
import Config

config :trento, TrentoWeb.Endpoint,
  check_origin: :conn,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :swoosh, local: false

# Do not print debug messages in production
# config :logger, level: :info

config :trento, Trento.Scheduler,
  jobs: [
    clusters_checks_execution: [
      schedule: {:extended, "@hourly"}
    ],
    heartbeat_fake: [
      schedule: {:extended, "*/5"},
      task: {Trento.Heartbeats.Faker, :send_heartbeats, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ]
  ]

config :trento, Trento.Integration.Checks, adapter: Trento.Integration.Checks.MockRunner

config :trento, Trento.Integration.Prometheus,
  adapter: Trento.Integration.Prometheus.MockPrometheusApi

config :trento, :extra_children, [Trento.Integration.Checks.MockRunner]

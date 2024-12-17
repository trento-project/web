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
    hosts_checks_execution: [
      schedule: {:extended, "@hourly"}
    ],
    heartbeat_fake: [
      schedule: {:extended, "*/5"},
      task: {Trento.Heartbeats.Faker, :send_heartbeats, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ]
  ]

config :trento, Trento.Infrastructure.Prometheus,
  adapter: Trento.Infrastructure.Prometheus.MockPrometheusApi

config :trento, Trento.Charts,
  host_data_fetcher: Trento.Infrastructure.Prometheus.MockPrometheusApi

config :trento, Trento.Infrastructure.SoftwareUpdates.MockSuma,
  relevant_patches_system_ids: [
    # 5870 matches to "vmhdbdev01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net" fqdn
    5870
  ]

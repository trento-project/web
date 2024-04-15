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

config :trento, suse_manager_enabled: true

config :trento, Trento.Infrastructure.SoftwareUpdates.MockSuma,
  relevant_patches: [
    %{
      date: "2024-02-27",
      advisory_name: "SUSE-15-SP4-2024-630",
      advisory_type: :bugfix,
      advisory_status: "stable",
      id: 4182,
      advisory_synopsis: "Recommended update for cloud-netconfig",
      update_date: "2024-02-27"
    },
    %{
      date: "2024-02-26",
      advisory_name: "SUSE-15-SP4-2024-619",
      advisory_type: :security_advisory,
      advisory_status: "stable",
      id: 4174,
      advisory_synopsis: "important: Security update for java-1_8_0-ibm",
      update_date: "2024-02-26"
    }
  ]

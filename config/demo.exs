# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

import Config

config :trento, TrentoWeb.Endpoint,
  check_origin: :conn,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :swoosh, local: false

# Do not print debug messages in production
# config :logger, level: :info

# Hourly checks executions, which also keeps the setting read only in the demo
config :trento, :checks_execution, interval: "1h"

config :trento, Trento.Scheduler,
  jobs: [
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

config :trento, Trento.Infrastructure.SoftwareUpdates.MockSmlm,
  relevant_patches_system_ids: [
    # 5870 matches to "vmhdbdev01.l15cqsinwnpu5gfyrf1r5l51fe.ax.internal.cloudapp.net" fqdn
    5870
  ]

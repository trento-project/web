import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :trento, Trento.Repo,
  username: "postgres",
  password: "postgres",
  database: "trento_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  port: 5433,
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :trento, Trento.EventStore,
  username: "postgres",
  password: "postgres",
  database: "trento_eventstore_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  port: 5433,
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :trento, TrentoWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "dN6epjGF+jdAdq1+q4cuJSMVwrwDMWUcakjB6ISxfFmvNziaOpBsJcCPaBaydJIk",
  server: false

# In test we don't send emails.
config :trento, Trento.Mailer, adapter: Swoosh.Adapters.Test

# Disable telemetry publishing during test
config :trento, Trento.Integration.Telemetry, adapter: Trento.Integration.Telemetry.ToLogger

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Agent heartbeat interval. Adding one extra second to the agent 5s interval to avoid glitches
config :trento, Trento.Heartbeats, interval: :timer.seconds(6)

# This is passed to the frontend as the time after the last heartbeat
# to wait before displaying the deregistration button
config :trento, deregistration_debounce: :timer.seconds(5)

config :trento,
  api_key_authentication_enabled: false,
  jwt_authentication_enabled: false

config :trento, Trento.Integration.Checks.AMQP.Consumer,
  processor: GenRMQ.Processor.Mock,
  queue: "trento.test.checks.results",
  exchange: "trento.test.checks",
  routing_key: "results",
  prefetch_count: "10",
  connection: "amqp://trento:trento@localhost:5673",
  queue_options: [
    durable: false,
    auto_delete: true
  ],
  deadletter_queue_options: [
    durable: false,
    auto_delete: true
  ]

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher,
  exchange: "trento.test.checks",
  connection: "amqp://trento:trento@localhost:5673"

config :trento, Trento.Scheduler,
  jobs: [
    heartbeat_check: [
      state: :inactive
    ]
  ]

config :trento, Trento.StreamRollUpEventHandler, max_stream_version: 10

config :joken,
  access_token_signer: "s2ZdE+3+ke1USHEJ5O45KT364KiXPYaB9cJPdH3p60t8yT0nkLexLBNw8TFSzC7k",
  refresh_token_signer: "L0wvcZh3ACQpibVhV/nh5jd/NaZWL4ijZxTxGJMGpacuXIBc4In3YCwXeVM98ygp"

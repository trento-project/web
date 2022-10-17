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

config :trento, :api_key_authentication, enabled: false

config :trento, :messaging, adapter: Trento.Messaging.Adapters.AMQP

config :trento, Trento.Messaging.Adapters.AMQP,
  publisher: [
    exchange: "trento.test.checks",
    connection: "amqp://trento:trento@localhost:5672"
  ]

config :trento, Trento.Integration.Checks.Wanda.Messaging.AMQP,
  processor: GenRMQ.Processor.Mock,
  consumer: [
    queue: "trento.test.checks.results",
    exchange: "trento.test.checks",
    routing_key: "results",
    prefetch_count: "10",
    connection: "amqp://trento:trento@localhost:5672",
    retry_delay_function: fn attempt -> :timer.sleep(2000 * attempt) end,
    queue_options: [
      durable: false,
      auto_delete: true
    ],
    deadletter_queue_options: [
      durable: false,
      auto_delete: true
    ]
  ]

config :trento,
  extra_children: [
    Trento.Messaging.Adapters.AMQP.Publisher,
    Trento.Integration.Checks.Wanda.Messaging.AMQP.Consumer
  ]

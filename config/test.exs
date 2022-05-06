import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
# Configure your database
config :trento, Trento.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  url: "postgres://postgres@localhost:5432/trento_test#{System.get_env("MIX_TEST_PARTITION")}"

config :trento, Trento.EventStore,
  url:
    "postgres://postgres@localhost:5432/trento_eventstore_test#{System.get_env("MIX_TEST_PARTITION")}"

config :trento, Trento.Commanded,
  event_store: [
    adapter: Commanded.EventStore.Adapters.InMemory,
    serializer: Commanded.Serialization.JsonSerializer
  ]

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :trento, TrentoWeb.Endpoint,
  secret_key_base: "dN6epjGF+jdAdq1+q4cuJSMVwrwDMWUcakjB6ISxfFmvNziaOpBsJcCPaBaydJIk",
  server: false

config :trento, Trento.Mailer, adapter: Swoosh.Adapters.Test

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

config :trento, :api_key_authentication, enabled: false

config :trento, :grafana,
  user: "admin",
  password: "admin",
  public_url: "http://localhost:3000",
  api_url: "http://localhost:3000/api"

config :trento, Trento.Integration.Checks.Runner, runner_url: "http://localhost:8080"

config :trento, :alerting, recipient: "mail@domain.tld"

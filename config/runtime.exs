import Config
import Trento.Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.

config :trento, Trento.Repo,
  url: System.get_env("DATABASE_URL") || "postgres://postgres@localhost:5433/#{db_name("trento")}",
  pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "10")

config :trento, Trento.EventStore,
  url: System.get_env("EVENTSTORE_URL") || "postgres://postgres@localhost:5433/#{db_name("trento_eventstore")}",
  pool_size: String.to_integer(System.get_env("EVENTSTORE_POOL_SIZE") || "10")

if config_env() == :prod do
  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """
  config :trento, TrentoWeb.Endpoint,
    secret_key_base: secret_key_base
end

config :trento, TrentoWeb.Endpoint,
  http: [
    # Enable IPv6 and bind on all interfaces.
    # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
    # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
    # for details about using IPv6 vs IPv4 and loopback vs public addresses.
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT") || "4000")
  ]

config :trento, Trento.Integration.Checks.Runner,
  runner_url: System.get_env("RUNNER_URL") || "http://localhost:8080"

config :trento, :grafana,
  user: System.get_env("GRAFANA_USER") || "admin",
  password: System.get_env("GRAFANA_PASSWORD") || "admin",
  public_url: System.get_env("GRAFANA_PUBLIC_URL") || "http://localhost:3000",
  api_url: System.get_env("GRAFANA_API_URL") || "http://localhost:3000/api"

# ## Using releases
#
# If you are doing OTP releases, you need to instruct Phoenix
# to start each relevant endpoint:
#
#     config :trento, TrentoWeb.Endpoint, server: true
#
# Then you can assemble a release by calling `mix release`.
# See `mix help release` for more information.

# ## Configuring the mailer
#
# In production you need to configure the mailer to use a different adapter.
# Also, you may need to configure the Swoosh API client of your choice if you
# are not using SMTP. Here is an example of the configuration:
#
#     config :trento, Trento.Mailer,
#       adapter: Swoosh.Adapters.Mailgun,
#       api_key: System.get_env("MAILGUN_API_KEY"),
#       domain: System.get_env("MAILGUN_DOMAIN")
#
# For this example you need include a HTTP client required by Swoosh API client.
# Swoosh supports Hackney and Finch out of the box:
#
#     config :swoosh, :api_client, Swoosh.ApiClient.Hackney
#
# See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.

config :trento, :alerting,
  enabled: System.get_env("ENABLE_ALERTING") == "true",
  recipient: System.get_env("ALERT_RECIPIENT") || "admin@trento-project.io"

config :trento, Trento.Mailer,
  adapter: Swoosh.Adapters.SMTP,
  relay: System.get_env("SMTP_SERVER") || "",
  port: System.get_env("SMTP_PORT") || "",
  username: System.get_env("SMTP_USER") || "",
  password: System.get_env("SMTP_PASSWORD") || "",
  auth: :always,
  ssl: :if_available,
  tls: :if_available

config :trento, Trento.Scheduler,
  jobs: [
    clusters_checks_execution: [
      # Runs every five minutes by default
      schedule: "*/#{System.get_env("RUNNER_INTERVAL", "5")} * * * *"
    ]
  ]

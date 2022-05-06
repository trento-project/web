import Config
import Trento.Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.

config :trento, Trento.Repo,
  url:
    System.get_env("DATABASE_URL") || fallback([Trento.Repo, :url]) ||
      raise("Missing required environment variable: DATABASE_URL"),
  pool_size: get_env_int("DATABASE_POOL_SIZE") || fallback([Trento.Repo, :pool_size])

config :trento, Trento.EventStore,
  url:
    System.get_env("EVENTSTORE_URL") || fallback([Trento.EventStore, :url]) ||
      raise("Missing required environment variable: EVENTSTORE_URL"),
  pool_size: get_env_int("EVENTSTORE_POOL_SIZE") || fallback([Trento.EventStore, :pool_size])

config :trento, TrentoWeb.Endpoint,
  http: [
    port: get_env_int("PORT") || fallback([TrentoWeb.Endpoint, :http, :port])
  ],
  secret_key_base:
    System.get_env("SECRET_KEY_BASE") || fallback([TrentoWeb.Endpoint, :secret_key_base]) ||
      raise("Missing required environment variable: SECRET_KEY_BASE")

config :trento, Trento.Integration.Checks.Runner,
  runner_url:
    System.get_env("RUNNER_URL") || fallback([Trento.Integration.Checks.Runner, :runner_url]) ||
      raise("Missing required environment variable: RUNNER_URL")

config :trento, :grafana,
  user: System.get_env("GRAFANA_USER") || fallback([:grafana, :user]),
  password: System.get_env("GRAFANA_PASSWORD") || fallback([:grafana, :password]),
  public_url: System.get_env("GRAFANA_PUBLIC_URL") || fallback([:grafana, :public_url]),
  api_url: System.get_env("GRAFANA_API_URL") || fallback([:grafana, :api_url])

enable_alerting =
  case get_env_bool("ENABLE_ALERTING") do
    value when is_boolean(value) -> value
    nil -> fallback([:alerting, :enabled])
  end

alert_recipient = System.get_env("ALERT_RECIPIENT") || fallback([:alerting, :recipient])

if enable_alerting and is_nil(alert_recipient) do
  raise("Missing required environment variable: ALERT_RECIPIENT")
end

config :trento, :alerting,
  enabled: enable_alerting,
  recipient: alert_recipient

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
config :trento, Trento.Mailer,
  relay: System.get_env("SMTP_SERVER") || fallback([Trento.Mailer, :relay]),
  port: System.get_env("SMTP_PORT") || fallback([Trento.Mailer, :port]),
  username: System.get_env("SMTP_USER") || fallback([Trento.Mailer, :username]),
  password: System.get_env("SMTP_PASSWORD") || fallback([Trento.Mailer, :password])

# RUNNER_INTERVAL env var is always expressed in minutes, but fallback values are different
# so we need to do some interpolation in the crontab format
runner_schedule =
  case get_env_int("RUNNER_INTERVAL") do
    value when is_integer(value) -> "*/#{value} * * * *"
    nil -> fallback([Trento.Scheduler, :jobs, :clusters_checks_execution, :schedule])
  end

config :trento, Trento.Scheduler,
  jobs: [
    clusters_checks_execution: [
      schedule: runner_schedule
    ]
  ]

# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :trento,
  ecto_repos: [Trento.Repo]

# Configures the endpoint
config :trento, TrentoWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: TrentoWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Trento.PubSub,
  live_view: [signing_salt: "4tNZ+tm7"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :trento, Trento.Mailer, adapter: Swoosh.Adapters.Local

# Swoosh API client is needed for adapters other than SMTP.
config :swoosh, :api_client, false

# configure the recipient for alert notifications
config :trento, :alerting,
  enabled: true,
  sender: "alerts@trento-project.io",
  recipient: "admin@trento.io"

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.12.18",
  default: [
    args:
      ~w(js/app.js js/trento.jsx --bundle --target=es2016 --loader:.svg=dataurl --loader:.png=dataurl --outdir=../priv/static/assets --external:/fonts/* --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :error]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Redact sensitive parameters in phoenix logs
config :phoenix, :filter_parameters, ["password", "totp_code"]

config :trento, Trento.Commanded, adapter: Trento.Commanded

config :trento, Trento.Commanded,
  event_store: [
    adapter: Commanded.EventStore.Adapters.EventStore,
    event_store: Trento.EventStore
  ],
  pubsub: :local,
  registry: :local

config :trento, Trento.Infrastructure.Commanded.EventHandlers.StreamRollUpEventHandler,
  max_stream_version: 10_000

config :trento, Trento.EventStore,
  serializer: Trento.Support.JsonbSerializer,
  column_data_type: "jsonb",
  types: EventStore.PostgresTypes

config :trento, event_stores: [Trento.EventStore]

config :trento, :pow,
  user: Trento.Users.User,
  repo: Trento.Repo,
  users_context: Trento.Users,
  web_module: TrentoWeb,
  extensions: [PowPersistentSession],
  controller_callbacks: Pow.Extension.Phoenix.ControllerCallbacks

config :trento, :pow_assent, user_identities_context: Trento.UserIdentities

config :trento, :oidc, enabled: false
config :trento, :oauth2, enabled: false

config :trento, :saml,
  enabled: false,
  user_profile_attributes: %{
    username_field: "username",
    email_field: "email",
    first_name_field: "firstName",
    last_name_field: "lastName"
  }

# Agent heartbeat interval. Adding one extra second to the agent 5s interval to avoid glitches
config :trento, Trento.Heartbeats, interval: :timer.seconds(6)

# This is passed to the frontend as the time after the last heartbeat
# to wait before displaying the deregistration button
config :trento, deregistration_debounce: :timer.seconds(0)

config :trento, Trento.Scheduler,
  jobs: [
    heartbeat_check: [
      # Runs every ten seconds
      schedule: {:extended, "*/10"},
      task: {Trento.Heartbeats, :dispatch_heartbeat_failed_commands, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ],
    clusters_checks_execution: [
      # Runs every five minutes
      schedule: "*/5 * * * *",
      task: {Trento.Clusters, :request_clusters_checks_execution, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ],
    hosts_checks_execution: [
      # Runs every five minutes
      schedule: "*/5 * * * *",
      task: {Trento.Hosts, :request_hosts_checks_execution, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ],
    discover_software_updates: [
      # Runs every 12 hours. At 00:00 and 12:00
      schedule: "0 */12 * * *",
      task: {Trento.SoftwareUpdates, :run_discovery, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ],
    api_key_expiration_alert: [
      schedule: "@daily",
      task: {Trento.Infrastructure.Alerting.Alerting, :notify_api_key_expiration, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ],
    activity_log_cleaning: [
      schedule: "@daily",
      task: {Trento.ActivityLog, :clear_expired_logs, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ]
  ],
  debug_logging: false

config :trento, Trento.Infrastructure.Messaging,
  adapter: Trento.Infrastructure.Messaging.Adapter.AMQP

config :trento, Trento.Infrastructure.Checks.AMQP.Consumer,
  processor: Trento.Infrastructure.Checks.AMQP.Processor,
  queue: "trento.checks.results",
  exchange: "trento.checks",
  routing_key: "results",
  prefetch_count: "10",
  connection: "amqp://guest:guest@localhost:5672"

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher,
  exchange: "trento.checks",
  connection: "amqp://guest:guest@localhost:5672"

config :trento, Trento.Infrastructure.Prometheus,
  adapter: Trento.Infrastructure.Prometheus.PrometheusApi

config :trento, Trento.Infrastructure.Prometheus.PrometheusApi, url: "http://localhost:9090"

config :trento, Trento.Charts,
  enabled: true,
  host_data_fetcher: Trento.Infrastructure.Prometheus.PrometheusApi

config :trento,
  uuid_namespace: "fb92284e-aa5e-47f6-a883-bf9469e7a0dc"

config :fun_with_flags,
       :persistence,
       adapter: FunWithFlags.Store.Persistent.Ecto,
       repo: Trento.Repo

config :fun_with_flags, :cache_bust_notifications,
  enabled: true,
  adapter: FunWithFlags.Notifications.PhoenixPubSub,
  client: Trento.PubSub

config :trento, :jwt_authentication,
  issuer: "https://github.com/trento-project/web",
  app_audience: "trento_app",
  api_key_audience: "trento_api_key",
  # Seconds, 3 minutes
  access_token_expiration: 180,
  # Seconds, 6 hours
  refresh_token_expiration: 21600

config :trento,
  api_key_authentication_enabled: true,
  jwt_authentication_enabled: true,
  operations_enabled: true

config :trento, :analytics,
  enabled: false,
  analytics_key: "",
  analytics_url: ""

config :trento, Trento.Vault,
  ciphers: [
    default: {
      Cloak.Ciphers.AES.GCM,
      tag: "AES.GCM.V1",
      key: Base.decode64!("daiZrktNorNeytJ1On7+OHk0eA/yZFBucZ/+gBv5bDU="),
      iv_length: 12
    }
  ]

config :trento, Trento.SoftwareUpdates.Discovery,
  adapter: Trento.Infrastructure.SoftwareUpdates.MockSuma

config :trento, Trento.Infrastructure.SoftwareUpdates.Suma,
  auth: Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuth

config :trento, Trento.Infrastructure.SoftwareUpdates.SumaApi,
  executor: Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

config :bodyguard,
  # The second element of the {:error, reason} tuple returned on auth failure
  default_error: :forbidden

config :flop, repo: Trento.Repo

config :trento,
  admin_user: "admin"

config :trento, :activity_log, refresh_interval: 60_000

config :trento, Trento.Repo, types: Trento.Postgrex.Types

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"

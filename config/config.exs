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
  render_errors: [view: TrentoWeb.ErrorView, accepts: ~w(html json), layout: false],
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
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :trento, Trento.Commanded,
  event_store: [
    adapter: Commanded.EventStore.Adapters.EventStore,
    event_store: Trento.EventStore
  ],
  pubsub: :local,
  registry: :local

config :trento, Trento.EventStore, serializer: EventStore.TermSerializer

config :trento, event_stores: [Trento.EventStore]

config :trento, :pow,
  user: Trento.User,
  repo: Trento.Repo,
  web_module: TrentoWeb,
  extensions: [PowPersistentSession],
  controller_callbacks: Pow.Extension.Phoenix.ControllerCallbacks

config :trento, Trento.Heartbeats, interval: :timer.seconds(5)

config :trento, Trento.Scheduler,
  jobs: [
    heartbeat_check: [
      # Runs every ten seconds
      schedule: {:extended, "*/10"},
      task: {Trento.Heartbeats, :dispatch_heartbeat_failed_commands, []},
      run_strategy: {Quantum.RunStrategy.Random, :cluster},
      overlap: false
    ]
  ],
  debug_logging: false

config :trento,
  uuid_namespace: "fb92284e-aa5e-47f6-a883-bf9469e7a0dc"

config :vex,
  sources: [
    [uuid: Trento.Support.UUIDValidator],
    Vex.Validators
  ]

config :fun_with_flags,
       :persistence,
       adapter: FunWithFlags.Store.Persistent.Ecto,
       repo: Trento.Repo

config :fun_with_flags, :cache_bust_notifications,
  enabled: true,
  adapter: FunWithFlags.Notifications.PhoenixPubSub,
  client: Trento.PubSub

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"

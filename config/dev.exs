import Config

# Configure your database
config :trento, Trento.Repo,
  username: "postgres",
  password: "postgres",
  database: "trento_dev",
  hostname: "localhost",
  port: 5433,
  show_sensitive_data_on_connection_error: true,
  pool_size: 5,
  log: false

config :trento, Trento.EventStore,
  username: "postgres",
  password: "postgres",
  database: "trento_eventstore_dev",
  hostname: "localhost",
  port: 5433,
  pool_size: 5

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with esbuild to bundle .js and .css sources.
config :trento, TrentoWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "s2ZdE+3+ke1USHEJ5O45KT364KiXPYaB9cJPdH3p60t8yT0nkLexLBNw8TFSzC7k",
  watchers: [
    node: [
      "build.js",
      cd: Path.expand("../assets", __DIR__),
      env: %{"ESBUILD_WATCH" => "true"}
    ],
    npx: [
      "tailwindcss",
      "--input=css/app.css",
      "--output=../priv/static/assets/app.css",
      "--postcss",
      "--watch",
      cd: Path.expand("../assets", __DIR__)
    ]
  ]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Note that this task requires Erlang/OTP 20 or later.
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :trento, TrentoWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/trento_web/(live|views)/.*(ex)$",
      ~r"lib/trento_web/templates/.*(eex)$"
    ]
  ]

unless IEx.started?() do
  config :trento, Trento.Scheduler,
    jobs: [
      clusters_checks_execution: [
        schedule: {:extended, "@hourly"}
      ],
      hosts_checks_execution: [
        schedule: {:extended, "@hourly"}
      ]
    ]
end

config :trento, Trento.Infrastructure.Checks.AMQP.Consumer,
  connection: "amqp://trento:trento@localhost:5673"

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher,
  connection: "amqp://trento:trento@localhost:5673"

config :trento, Trento.Infrastructure.Prometheus,
  adapter: Trento.Infrastructure.Prometheus.MockPrometheusApi

config :trento, Trento.Infrastructure.SoftwareUpdates.MockSuma,
  relevant_patches_system_ids: [
    # vmdrbddev01
    5980
  ]

# Do not include metadata nor timestamps in development logs
# config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :trento,
  api_key_authentication_enabled: false

config :joken,
  access_token_signer: "s2ZdE+3+ke1USHEJ5O45KT364KiXPYaB9cJPdH3p60t8yT0nkLexLBNw8TFSzC7k",
  refresh_token_signer: "L0wvcZh3ACQpibVhV/nh5jd/NaZWL4ijZxTxGJMGpacuXIBc4In3YCwXeVM98ygp"

config :trento, :checks_service, base_url: "http://localhost:4001"

config :unplug, :init_mode, :runtime

config :open_api_spex, :cache_adapter, OpenApiSpex.Plug.NoneCache

config :trento, :oidc,
  enabled: false,
  callback_url: "http://localhost:4000/auth/oidc_callback"

config :trento, :oauth2,
  enabled: false,
  callback_url: "http://localhost:4000/auth/oauth2_callback"

config :trento, :pow_assent,
  providers: [
    saml_local: [
      strategy: TrentoWeb.Auth.AssentSamlStrategy
    ],
    oauth2_local: [
      client_id: "trento-web",
      client_secret: "ihfasdEaB5M5r44i4AbNulmLWjgejluX",
      auth_method: :client_secret_post,
      base_url: "http://localhost:8081/realms/trento",
      authorize_url: "http://localhost:8081/realms/trento/protocol/openid-connect/auth",
      token_url: "http://localhost:8081/realms/trento/protocol/openid-connect/token",
      user_url: "http://localhost:8081/realms/trento/protocol/openid-connect/userinfo",
      authorization_params: [scope: "openid profile email"],
      strategy: Assent.Strategy.OAuth2
    ],
    oidc_local: [
      client_id: "trento-web",
      client_secret: "ihfasdEaB5M5r44i4AbNulmLWjgejluX",
      strategy: Assent.Strategy.OIDC,
      base_url: "http://localhost:8081/realms/trento",
      # The default oidc ones, replicated just for the sake of docs
      authorization_params: [scope: "openid profile"]
    ]
  ]

config :trento, :saml,
  enabled: false,
  callback_url: "/auth/saml_callback",
  idp_id: "saml"

config :samly, Samly.Provider,
  idp_id_from: :path_segment,
  service_providers: [
    %{
      id: "trento-saml",
      entity_id: "trento-web-saml",
      certfile: "container_fixtures/keycloak/saml/cert/saml_sp.pem",
      keyfile: "container_fixtures/keycloak/saml/cert/saml_sp_key.pem"
    }
  ],
  identity_providers: [
    %{
      id: "saml",
      sp_id: "trento-saml",
      base_url: "http://localhost:4000/sso",
      metadata_file: "container_fixtures/keycloak/saml/metadata.xml",
      sign_requests: true,
      sign_metadata: true,
      signed_assertion_in_resp: true,
      signed_envelopes_in_resp: true,
      nameid_format: :persistent
    }
  ]

# Override with local dev.local.exs file
if File.exists?("#{__DIR__}/dev.local.exs") do
  import_config "dev.local.exs"
end

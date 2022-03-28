import Config

config :trento, TrentoWeb.Endpoint,
  check_origin: :conn,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

  config :trento, Trento.Integration.Checks,
    runner_url: System.get_env("RUNNER_URL")

# Do not print debug messages in production
# config :logger, level: :info

import Config

config :trento, TrentoWeb.Endpoint,
  check_origin: :conn,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :swoosh, local: false

# Do not print debug messages in production
# config :logger, level: :info

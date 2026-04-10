import Config

config :trento, TrentoWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :swoosh, local: false

config :trento, Trento.SoftwareUpdates.Discovery,
  adapter: Trento.Infrastructure.SoftwareUpdates.Suma

config :trento,
  operations_enabled: true

config :trento, :ai, enabled: true

config :logger, level: :info

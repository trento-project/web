Mox.defmock(Trento.Integration.Telemetry.Mock, for: Trento.Integration.Telemetry.Gen)

Application.put_env(:trento, Trento.Integration.Telemetry,
  adapter: Trento.Integration.Telemetry.Mock
)

Mox.defmock(Trento.Integration.Checks.Mock, for: Trento.Integration.Checks.Gen)
Application.put_env(:trento, Trento.Integration.Checks, adapter: Trento.Integration.Checks.Mock)

Mox.defmock(Trento.Integration.Prometheus.Mock, for: Trento.Integration.Prometheus.Gen)

Application.put_env(:trento, Trento.Integration.Prometheus,
  adapter: Trento.Integration.Prometheus.Mock
)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Trento.Repo, :manual)

Faker.start()

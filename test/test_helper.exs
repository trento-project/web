Mox.defmock(Trento.Integration.Telemetry.Mock, for: Trento.Integration.Telemetry.Gen)

Application.put_env(:trento, Trento.Integration.Telemetry,
  adapter: Trento.Integration.Telemetry.Mock
)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Trento.Repo, :manual)

Faker.start()

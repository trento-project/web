defmodule Trento.Integration.TelemetryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Installation
  alias Trento.Integration.Telemetry

  setup :verify_on_exit!

  setup do
    Application.put_env(:trento, :flavor, "Premium")
    insert(:sles_subscription, identifier: "SLES_SAP")
    Installation.accept_eula()

    on_exit(fn -> Application.put_env(:trento, :flavor, "Community") end)
  end

  test "should publish hosts telemetry if telemetry is enabled" do
    host_telemetry = insert(:host_telemetry)

    expect(Trento.Integration.Telemetry.Mock, :publish_hosts_telemetry, fn hosts_telemetry, _ ->
      assert [host_telemetry] == hosts_telemetry
      :ok
    end)

    assert :ok = Telemetry.publish()
  end
end

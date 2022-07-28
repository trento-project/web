defmodule Trento.Integration.TelemetryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.Installation
  alias Trento.Integration.Telemetry

  setup :verify_on_exit!

  setup do
    Installation.accept_eula()

    on_exit(fn -> Application.put_env(:trento, :flavor, "Community") end)
  end

  test "should publish hosts telemetry with community flavor" do
    host_telemetry = insert(:host_telemetry)

    expect(Trento.Integration.Telemetry.Mock, :publish_hosts_telemetry, fn hosts_telemetry,
                                                                           installation_id,
                                                                           flavor ->
      assert [host_telemetry] == hosts_telemetry
      assert Installation.get_installation_id() == installation_id
      assert "Community" == flavor
      :ok
    end)

    assert :ok = Telemetry.publish()
  end

  test "should publish hosts telemetry with premium flavor" do
    Application.put_env(:trento, :flavor, "Premium")
    host_telemetry = insert(:host_telemetry)

    expect(Trento.Integration.Telemetry.Mock, :publish_hosts_telemetry, fn hosts_telemetry,
                                                                           installation_id,
                                                                           flavor ->
      assert [host_telemetry] == hosts_telemetry
      assert Installation.get_installation_id() == installation_id
      assert "Premium" == flavor
      :ok
    end)

    assert :ok = Telemetry.publish()
  end
end

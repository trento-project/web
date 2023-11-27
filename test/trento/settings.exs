defmodule Trento.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Settings

  setup do
    Application.put_env(:trento, :flavor, "Premium")
    insert(:sles_subscription, identifier: "SLES_SAP")

    on_exit(fn -> Application.put_env(:trento, :flavor, "Community") end)
  end

  test "should return premium active if flavor is premium and at least one SLES_SAP subscription exist" do
    assert Settings.premium_active?()
  end

  test "should give the flavor for the current installation" do
    Application.put_env(:trento, :flavor, "Premium")
    assert Settings.flavor() === "Premium"

    Application.put_env(:trento, :flavor, "Community")
    assert Settings.flavor() === "Community"
  end
end

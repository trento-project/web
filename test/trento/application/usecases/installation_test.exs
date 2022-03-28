defmodule Trento.InstallationTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Installation

  setup do
    Application.put_env(:trento, :flavor, "Premium")
    subscription_projection(identifier: "SLES_SAP")

    on_exit(fn -> Application.put_env(:trento, :flavor, "Community") end)
  end

  test "should return premium active if flavor is premium and at least one SLES_SAP subscription exist" do
    assert Installation.premium_active?()
  end

  test "should give the flavor for the current installation" do
    Application.put_env(:trento, :flavor, "Premium")
    assert Installation.flavor() === "Premium"

    Application.put_env(:trento, :flavor, "Community")
    assert Installation.flavor() === "Community"
  end
end

defmodule Trento.InstallationTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Installation

  setup do
    Application.put_env(:trento, :flavor, "Premium")
    insert(:sles_subscription, identifier: "SLES_SAP")

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

  test "should provide the API key of the current installation" do
    installation_id = Installation.get_installation_id()
    api_key = Installation.get_api_key()

    assert {:ok, decoded_data} = Trento.Application.Auth.ApiKey.verify(api_key)
    assert %{installation_id: ^installation_id} = decoded_data
  end
end

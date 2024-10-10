defmodule TrentoWeb.V1.AboutJSONTest do
  use ExUnit.Case, async: true

  import Trento.Factory

  alias TrentoWeb.V1.AboutJSON

  test "should render about/1" do
    version = "1.0.0"
    sles_subscriptions = build_list(2, :sles_subscription)

    result =
      AboutJSON.about(%{
        about_info: %{
          version: version,
          sles_subscriptions: sles_subscriptions
        }
      })

    assert result == %{
             version: version,
             sles_subscriptions: sles_subscriptions,
             flavor: "Community"
           }
  end
end

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
          sles_subscriptions: sles_subscriptions,
          wanda_version: "1.2.0",
          checks_version: "1.0.0",
          postgres_version: "16.1",
          rabbitmq_version: "3.12.0",
          prometheus_version: "2.48.0"
        }
      })

    assert result == %{
             version: version,
             sles_subscriptions: sles_subscriptions,
             flavor: "Community",
             wanda_version: "1.2.0",
             checks_version: "1.0.0",
             postgres_version: "16.1",
             rabbitmq_version: "3.12.0",
             prometheus_version: "2.48.0"
           }
  end

  test "should render about/1 with nil versions when not available" do
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
             flavor: "Community",
             wanda_version: nil,
             checks_version: nil,
             postgres_version: nil,
             rabbitmq_version: nil,
             prometheus_version: nil
           }
  end
end

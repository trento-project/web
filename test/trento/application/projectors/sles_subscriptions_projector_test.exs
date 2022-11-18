defmodule Trento.SlesSubscriptionsProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.{
    SlesSubscriptionReadModel,
    SlesSubscriptionsProjector
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:hosts")

    %{socket: socket}
  end

  test "should project a new subscription when SubscriptionsUpdated event is received" do
    %{host_id: host_id} = event = build(:subscriptions_updated_event)
    %{subscriptions: [subscription]} = event

    ProjectorTestHelper.project(SlesSubscriptionsProjector, event, "sles_subscription_projector")
    sles_subscription_projection = Repo.get_by!(SlesSubscriptionReadModel, host_id: event.host_id)

    assert subscription.host_id == event.host_id
    assert subscription.identifier == sles_subscription_projection.identifier
    assert subscription.arch == sles_subscription_projection.arch
    assert subscription.status == sles_subscription_projection.status
    assert subscription.version == sles_subscription_projection.version

    assert_broadcast "host_details_updated",
                     %{
                       id: ^host_id,
                       sles_subscriptions: [^subscription]
                     },
                     1000
  end
end

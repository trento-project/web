defmodule Tronto.Monitoring.SlesSubscriptionsProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Tronto.Factory

  alias Tronto.Monitoring.{
    SlesSubscriptionReadModel,
    SlesSubscriptionsProjector
  }

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test "should project a new subscription when SubscriptionsUpdated event is received" do
    event = subscriptions_updated_event()
    %{subscriptions: [subscription]} = event

    ProjectorTestHelper.project(SlesSubscriptionsProjector, event, "sles_subscription_projector")
    sles_subscription_projection = Repo.get_by!(SlesSubscriptionReadModel, host_id: event.host_id)

    assert subscription.host_id == event.host_id
    assert subscription.identifier == sles_subscription_projection.identifier
    assert subscription.arch == sles_subscription_projection.arch
    assert subscription.status == sles_subscription_projection.status
    assert subscription.version == sles_subscription_projection.version
  end
end

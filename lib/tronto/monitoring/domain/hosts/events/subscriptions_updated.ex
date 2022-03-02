defmodule Tronto.Monitoring.Domain.Events.SubscriptionsUpdated do
  @moduledoc """
  Subscription updated event
  """

  alias Tronto.Monitoring.Domain.Subscription

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SubscriptionsUpdated event"

    field :host_id, String.t(), enforce: true
    field :subscriptions, [Subscription.t()], enforce: true
  end
end

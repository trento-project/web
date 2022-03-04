defmodule Tronto.Monitoring.Domain.Events.SlesSubscriptionsUpdated do
  @moduledoc """
  Subscriptions updated event
  """

  alias Tronto.Monitoring.Domain.SlesSubscription

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SubscriptionsUpdated event"

    field :host_id, String.t(), enforce: true
    field :subscriptions, [SlesSubscription.t()], enforce: true
  end
end

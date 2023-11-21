defmodule Trento.Hosts.Events.SlesSubscriptionsUpdated do
  @moduledoc """
  Subscriptions updated event
  """

  alias Trento.Hosts.ValueObjects.SlesSubscription

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    embeds_many :subscriptions, SlesSubscription
  end
end

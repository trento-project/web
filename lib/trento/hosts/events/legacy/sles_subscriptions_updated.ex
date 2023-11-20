defmodule Trento.Domain.Events.SlesSubscriptionsUpdated do
  @moduledoc """
  Subscriptions updated event
  """

  alias Trento.Hosts.SlesSubscription

  use Trento.Event

  defevent superseeded_by: Trento.Hosts.Events.SlesSubscriptionsUpdated do
    field :host_id, Ecto.UUID
    embeds_many :subscriptions, SlesSubscription
  end
end

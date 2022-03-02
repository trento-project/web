defmodule Tronto.Monitoring.Domain.Commands.UpdateSubscriptions do
  @moduledoc """
  Updated data relative to subscriptions.
  """

  use TypedStruct
  use Domo

  alias Tronto.Monitoring.Domain.Subscription

  typedstruct do
    @typedoc "UpdateSubscriptions command"

    field :subscriptions, [Subscription.t()], enforce: true
    field :host_id, String.t(), enforce: true
  end

  use Vex.Struct

  validates :host_id, uuid: true
end

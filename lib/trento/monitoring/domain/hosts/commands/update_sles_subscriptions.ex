defmodule Trento.Monitoring.Domain.Commands.UpdateSlesSubscriptions do
  @moduledoc """
  Update data relative to subscriptions.
  """

  use TypedStruct
  use Domo

  alias Trento.Monitoring.Domain.SlesSubscription

  typedstruct do
    @typedoc "UpdateSubscriptions command"

    field :subscriptions, [SlesSubscription.t()], enforce: true
    field :host_id, String.t(), enforce: true
  end

  use Vex.Struct

  validates :host_id, uuid: true
end

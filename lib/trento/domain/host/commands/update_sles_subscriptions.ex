defmodule Trento.Domain.Commands.UpdateSlesSubscriptions do
  @moduledoc """
  Update data relative to subscriptions.
  """

  @required_fields :all

  use Trento.Command

  alias Trento.Domain.SlesSubscription

  defcommand do
    field :host_id, Ecto.UUID
    embeds_many :subscriptions, SlesSubscription
  end
end

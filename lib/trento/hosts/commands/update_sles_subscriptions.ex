defmodule Trento.Hosts.Commands.UpdateSlesSubscriptions do
  @moduledoc """
  Update data relative to subscriptions.
  """

  @required_fields :all

  use Trento.Support.Command

  alias Trento.Hosts.ValueObjects.SlesSubscription

  defcommand do
    field :host_id, Ecto.UUID
    embeds_many :subscriptions, SlesSubscription
  end
end

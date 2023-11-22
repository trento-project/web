defmodule Trento.Hosts.Events.SaptuneStatusUpdated do
  @moduledoc """
  This event is emitted when saptune status is updated in a specific host.
  """

  use Trento.Support.Event

  alias Trento.Hosts.ValueObjects.SaptuneStatus

  defevent do
    field :host_id, Ecto.UUID
    embeds_one :status, SaptuneStatus
  end
end

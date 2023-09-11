defmodule Trento.Domain.Events.SaptuneStatusUpdated do
  @moduledoc """
  This event is emitted when saptune status is updated in a specific host.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    # TODO: Update this with the final data struct and embeds_one
    field :status, :map
  end
end

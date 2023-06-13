defmodule Trento.Domain.Events.HostRestored do
  @moduledoc """
    This event is emitted when an host is restored from a deregistered state
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end

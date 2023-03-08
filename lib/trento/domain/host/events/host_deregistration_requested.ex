defmodule Trento.Domain.Host.Events.HostDeregistrationRequested do
  @moduledoc """
    This event is emitted when a deregistration (decomission) of a host is requested.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end

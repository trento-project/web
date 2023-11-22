defmodule Trento.Hosts.Events.HostTombstoned do
  @moduledoc """
    This event is emitted after a successful host deregistration, to tombstone and stop the host aggregate
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end

defmodule Trento.Domain.Events.HostTombstoned do
  @moduledoc """
    This event is emitted after a successful host deregistration, to tombstone and stop the host aggregate
  """

  use Trento.Event

  defevent superseded_by: Trento.Hosts.Events.HostTombstoned do
    field :host_id, Ecto.UUID
  end
end

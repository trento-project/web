defmodule Trento.Domain.Events.HostRollUpRequested do
  @moduledoc """
  This event is emitted when an host roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the host aggregate.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    embeds_one :snapshot, Trento.Domain.Host
  end
end

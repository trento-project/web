defmodule Trento.Domain.Events.HostRollUpRequested do
  @moduledoc """
  This event is emitted when an host roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the host aggregate.
  """

  use Trento.Support.Event

  alias Trento.Hosts.Host

  defevent superseded_by: Trento.Hosts.Events.HostRollUpRequested do
    field :host_id, Ecto.UUID
    embeds_one :snapshot, Host
  end
end

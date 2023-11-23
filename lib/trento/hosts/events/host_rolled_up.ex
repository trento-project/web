defmodule Trento.Hosts.Events.HostRolledUp do
  @moduledoc """
  This event is emitted when an host is rolled up and its stream is archived.
  It contains the snapshot of the host aggregate that will be used to restore the aggregate state.
  """

  use Trento.Support.Event

  alias Trento.Hosts.Host

  defevent do
    field :host_id, Ecto.UUID
    embeds_one :snapshot, Host
  end
end

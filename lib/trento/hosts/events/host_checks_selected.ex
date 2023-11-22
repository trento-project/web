defmodule Trento.Hosts.Events.HostChecksSelected do
  @moduledoc """
  Event of the checks selected for a host.
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end

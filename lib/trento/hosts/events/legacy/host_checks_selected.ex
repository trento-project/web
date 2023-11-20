defmodule Trento.Domain.Events.HostChecksSelected do
  @moduledoc """
  Event of the checks selected for a host.
  """

  use Trento.Event

  defevent superseeded_by: Trento.Hosts.Events.HostChecksSelected do
    field :host_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end

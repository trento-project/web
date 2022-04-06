defmodule Trento.Domain.Events.HostChecksExecutionUnreachable do
  @moduledoc """
  Event of the checks execution unreachable of a host.
  """

  use Trento.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :msg, :string
  end
end

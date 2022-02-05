defmodule Tronto.Monitoring.Domain.Events.ChecksSelected do
  @moduledoc """
    Event of the checks selected in a cluster.
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SelecteChecks event"

    field :cluster_id, String.t(), enforce: true
    field :checks, [String.t()], enforce: true
  end
end

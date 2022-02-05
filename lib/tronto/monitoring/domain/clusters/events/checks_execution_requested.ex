defmodule Tronto.Monitoring.Domain.Events.ChecksExecutionRequested do
  @moduledoc """
  Event of the request of a checks execution.
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ChecksExecutionRequested event"

    field :cluster_id, String.t(), enforce: true
    field :hosts, [String.t()], enforce: true
    field :checks, [String.t()], enforce: true
  end
end

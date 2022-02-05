defmodule Tronto.Monitoring.Domain.Commands.RequestChecksExecution do
  @moduledoc """
    Request a checks execution.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "RequestChecksExecution command"

    field :cluster_id, String.t(), enforce: true
  end

  use Vex.Struct

  validates :cluster_id, uuid: true
end

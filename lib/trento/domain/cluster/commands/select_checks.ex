defmodule Trento.Domain.Commands.SelectChecks do
  @moduledoc """
  Select the checks to be executed in the cluster.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "SelecteChecks command"

    field :cluster_id, String.t(), enforce: true
    field :checks, [String.t()], enforce: true
  end

  use Vex.Struct

  validates :cluster_id, uuid: true
end

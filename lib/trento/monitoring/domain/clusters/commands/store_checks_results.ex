defmodule Trento.Monitoring.Domain.Commands.StoreChecksResults do
  @moduledoc """
  Store the checks results coming from an execution on a specific host.
  """

  use TypedStruct
  use Domo

  alias Trento.Monitoring.Domain.CheckResult

  typedstruct do
    @typedoc "StoreChecksResults command"

    field :cluster_id, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :checks_results, [CheckResult.t()], enforce: true
  end

  use Vex.Struct

  validates :cluster_id, uuid: true
  validates :host_id, uuid: true
end

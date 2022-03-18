defmodule Trento.Monitoring.Domain.Events.ChecksResultsStored do
  @moduledoc """
  Event of the checks results stored after an execution
  """

  use TypedStruct

  alias Trento.Monitoring.Domain.CheckResult

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ChecksResultsStored event"

    field :cluster_id, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :checks_results, [CheckResult.t()], enforce: true
  end
end

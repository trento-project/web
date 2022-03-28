defmodule Trento.Domain.Events.ChecksResultsStored do
  @moduledoc """
  Event of the checks results stored after an execution
  """

  use Trento.Event

  alias Trento.Domain.CheckResult

  defevent do
    field :cluster_id, :string
    field :host_id, :string

    embeds_many :checks_results, CheckResult
  end
end

defmodule Trento.Domain.Events.HostChecksExecutionCompleted do
  @moduledoc """
  Event of the checks execution completed of a host.
  """

  use Trento.Event

  alias Trento.Domain.CheckResult

  defevent do
    field :cluster_id, :string
    field :host_id, :string

    embeds_many :checks_results, CheckResult
  end
end

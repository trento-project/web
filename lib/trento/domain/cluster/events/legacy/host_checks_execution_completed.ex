defmodule Trento.Domain.Events.HostChecksExecutionCompleted do
  @moduledoc """
  Event of the checks execution completed of a host.
  """

  use Trento.Event

  alias Trento.Domain.CheckResult

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :reachable, :boolean
    field :msg, :string

    embeds_many :checks_results, CheckResult
  end
end

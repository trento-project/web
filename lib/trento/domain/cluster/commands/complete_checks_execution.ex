defmodule Trento.Domain.Commands.CompleteChecksExecution do
  @moduledoc """
  Store the checks results coming from an execution on a specific cluster.
  """

  defmodule HostExecution do
    @moduledoc """
    Host checks results value object
    """

    @required_fields :all

    use Trento.Type
    alias Trento.Domain.CheckResult

    deftype do
      field :host_id, Ecto.UUID

      embeds_many :checks_results, CheckResult
    end
  end

  @required_fields :all

  use Trento.Command

  alias Trento.Domain.CheckResult

  defcommand do
    field :cluster_id, Ecto.UUID
    embeds_many :hosts_executions, HostExecution
  end
end

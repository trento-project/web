defmodule Trento.Domain.Commands.CompleteChecksExecution do
  @moduledoc """
  Store the checks results coming from an execution on a specific cluster.
  """

  @required_fields :all

  use Trento.Command

  alias Trento.Domain.HostExecution

  defcommand do
    field :cluster_id, Ecto.UUID
    embeds_many :hosts_executions, HostExecution
  end
end

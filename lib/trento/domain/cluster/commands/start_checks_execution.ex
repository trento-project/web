defmodule Trento.Domain.Commands.StartChecksExecution do
  @moduledoc """
  Start a checks execution.
  """

  @required_fields [:cluster_id]

  use Trento.Command

  defcommand do
    field :cluster_id, Ecto.UUID
  end
end

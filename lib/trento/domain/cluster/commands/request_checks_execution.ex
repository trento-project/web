defmodule Trento.Domain.Commands.RequestChecksExecution do
  @moduledoc """
  Request a checks execution.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :cluster_id, Ecto.UUID
  end
end

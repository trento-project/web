defmodule Trento.Domain.Commands.CompleteHostChecksExecution do
  @moduledoc """
  Complete the checks execution with the incoming result
  """

  @required_fields :all

  use Trento.Command

  require Trento.Domain.Enums.Health, as: Health

  defcommand do
    field :host_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end

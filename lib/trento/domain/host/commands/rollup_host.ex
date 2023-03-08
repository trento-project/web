defmodule Trento.Domain.Commands.RollUpHost do
  @moduledoc """
  Start a host aggregate rollup
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end

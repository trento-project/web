defmodule Trento.Databases.Commands.RollUpDatabase do
  @moduledoc """
  Start a database aggregate rollup.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :database_id, Ecto.UUID
  end
end

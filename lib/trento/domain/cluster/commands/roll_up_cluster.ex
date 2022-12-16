defmodule Trento.Domain.Commands.RollUpCluster do
  @moduledoc """
  Start a cluster aggregate rollup.
  """

  @required_fields nil

  use Trento.Command

  defcommand do
    field :cluster_id, Ecto.UUID
  end
end

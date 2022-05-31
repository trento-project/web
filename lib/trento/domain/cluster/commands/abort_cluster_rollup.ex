defmodule Trento.Domain.Commands.AbortClusterRollup do
  @moduledoc """
  Compensation command that aborts the cluster rollup.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :cluster_id, Ecto.UUID
  end
end

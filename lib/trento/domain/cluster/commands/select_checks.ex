defmodule Trento.Domain.Commands.SelectChecks do
  @moduledoc """
  Select the checks to be executed in the cluster.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :cluster_id, :string
    field :checks, {:array, :string}
  end
end

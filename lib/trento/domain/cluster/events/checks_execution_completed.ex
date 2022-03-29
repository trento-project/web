defmodule Trento.Domain.Events.ChecksExecutionCompleted do
  @moduledoc """
  Event of the checks execution completed.
  """

  use Trento.Event

  defevent do
    field :cluster_id, :string
  end
end

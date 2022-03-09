defmodule Tronto.Monitoring.Domain.SapSystem.Database do
  @moduledoc """
  This module represents a SAP System database.
  """

  alias Tronto.Monitoring.Domain.Health

  defstruct [
    :sid,
    instances: [],
    health: :unknown
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          instances: [Instance],
          health: Health.t()
        }
end

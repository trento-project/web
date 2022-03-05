defmodule Tronto.Monitoring.Domain.SapSystem.Database do
  @moduledoc """
  This module represents a SAP System database.
  """

  defstruct [
    :sid,
    :tenant,
    instances: []
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          tenant: String.t(),
          instances: [Instance]
        }
end

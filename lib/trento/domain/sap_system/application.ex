defmodule Trento.Domain.SapSystem.Application do
  @moduledoc """
  This module represents a SAP System application.
  """

  defstruct [
    :sid,
    instances: []
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          instances: [Instance]
        }
end

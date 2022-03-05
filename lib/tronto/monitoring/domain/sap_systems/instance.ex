defmodule Tronto.Monitoring.Domain.SapSystem.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  defstruct [
    :sid,
    :instance_number,
    :features,
    :host_id
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          instance_number: String.t(),
          features: String.t(),
          host_id: String.t()
        }
end

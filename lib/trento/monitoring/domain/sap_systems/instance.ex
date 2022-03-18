defmodule Trento.Monitoring.Domain.SapSystem.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  alias Trento.Monitoring.Domain.Health

  defstruct [
    :sid,
    :instance_number,
    :features,
    :host_id,
    :health
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          instance_number: String.t(),
          features: String.t(),
          host_id: String.t(),
          health: Health.t()
        }
end

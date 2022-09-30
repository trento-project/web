defmodule Trento.Domain.SapSystem.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  alias Trento.Domain.Enum.Health

  defstruct [
    :sid,
    :instance_number,
    :features,
    :host_id,
    :health,
    :system_replication,
    :system_replication_status
  ]

  @type t :: %__MODULE__{
          sid: String.t(),
          instance_number: String.t(),
          features: String.t(),
          host_id: String.t(),
          health: Health.t(),
          system_replication: String.t(),
          system_replication_status: String.t()
        }
end

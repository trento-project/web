defmodule Tronto.Monitoring.Domain.Events.SapSystemHealthChanged do
  @moduledoc """
  This event is emitted when the SAP System health has changed.
  """

  use TypedStruct

  alias Tronto.Monitoring.Domain.Health

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SapSystemHealthChanged event"

    field :sap_system_id, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

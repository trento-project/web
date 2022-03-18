defmodule Trento.Monitoring.Domain.Events.DatabaseInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a database instance health has changed.
  """

  use TypedStruct

  alias Trento.Monitoring.Domain.Health

  @derive Jason.Encoder
  typedstruct do
    @typedoc "DatabaseInstanceHealthChanged event"

    field :sap_system_id, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :instance_number, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

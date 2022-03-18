defmodule Trento.Monitoring.Domain.Events.DatabaseInstanceRegistered do
  @moduledoc """
  This event is emitted when a database instance is registered to the SAP system.
  """

  use TypedStruct

  alias Trento.Monitoring.Domain.Health

  @derive Jason.Encoder
  typedstruct do
    @typedoc "DatabaseInstanceRegistered event"

    field :sap_system_id, String.t(), enforce: true
    field :sid, String.t(), enforce: true
    field :tenant, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :instance_number, String.t(), enforce: true
    field :features, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

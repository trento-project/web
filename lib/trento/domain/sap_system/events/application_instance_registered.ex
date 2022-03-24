defmodule Trento.Domain.Events.ApplicationInstanceRegistered do
  @moduledoc """
  This event is emitted when a database application is registered to the SAP system.
  """

  alias Trento.Domain.Health

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ApplicationInstanceRegistered event"

    field :sap_system_id, String.t(), enforce: true
    field :sid, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :instance_number, String.t(), enforce: true
    field :instance_hostname, String.t(), enforce: true
    field :features, String.t(), enforce: true
    field :http_port, integer, enforce: true
    field :https_port, integer, enforce: true
    field :start_priority, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

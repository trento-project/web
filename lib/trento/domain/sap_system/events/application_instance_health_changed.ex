defmodule Trento.Domain.Events.ApplicationInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a application instance health has changed.
  """

  use TypedStruct

  alias Trento.Domain.Health

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ApplicationInstanceHealthChanged event"

    field :sap_system_id, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :instance_number, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

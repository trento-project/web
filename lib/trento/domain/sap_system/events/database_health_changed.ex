defmodule Trento.Domain.Events.DatabaseHealthChanged do
  @moduledoc """
  This event is emitted when a database health has changed.
  """

  use TypedStruct

  alias Trento.Domain.Health

  @derive Jason.Encoder
  typedstruct do
    @typedoc "DatabaseHealthChanged event"

    field :sap_system_id, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

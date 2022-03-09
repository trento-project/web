defmodule Tronto.Monitoring.Domain.Events.DatabaseRegistered do
  @moduledoc """
  This event is emitted when a database is registered.
  """

  alias Tronto.Monitoring.Domain.Health

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "DatabaseRegistered event"

    field :sap_system_id, String.t(), enforce: true
    field :sid, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

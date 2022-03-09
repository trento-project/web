defmodule Tronto.Monitoring.Domain.Events.SapSystemRegistered do
  @moduledoc """
  This event is emitted when a sap system is registered.
  """

  alias Tronto.Monitoring.Domain.Health

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "SapSystemRegistered event"

    field :sap_system_id, String.t(), enforce: true
    field :sid, String.t(), enforce: true
    field :tenant, String.t(), enforce: true
    field :db_host, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end
end

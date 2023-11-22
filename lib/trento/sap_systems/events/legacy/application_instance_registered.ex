defmodule Trento.Domain.Events.ApplicationInstanceRegistered do
  @moduledoc """
  This event is emitted when a database application is registered to the SAP system.
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent superseded_by: Trento.SapSystems.Events.ApplicationInstanceRegistered do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end

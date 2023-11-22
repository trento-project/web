defmodule Trento.SapSystems.Commands.DeregisterApplicationInstance do
  @moduledoc """
  Deregister (decommission) an application instance from the monitoring system.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end

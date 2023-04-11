defmodule Trento.Domain.Commands.DeregisterApplicationInstance do
  @moduledoc """
  Deregister (decommission) an application instance from the monitoring system.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :instance_number, :string
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end

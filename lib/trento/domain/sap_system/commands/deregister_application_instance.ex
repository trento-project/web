defmodule Trento.Domain.Commands.DeregisterApplicationInstance do
  @moduledoc """
  Deregister (decommission) an application instance from the monitoring system.
  """

  @required_fields [
    :instance_number,
    :sap_system_id
  ]

  use Trento.Command

  defcommand do
    field :instance_number, :string
    field :sap_system_id, Ecto.UUID
  end
end

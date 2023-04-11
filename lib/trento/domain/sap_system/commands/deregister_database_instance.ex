defmodule Trento.Domain.Commands.DeregisterDatabaseInstance do
  @moduledoc """
  Deregister (decommission) a database instance from the monitoring system.
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

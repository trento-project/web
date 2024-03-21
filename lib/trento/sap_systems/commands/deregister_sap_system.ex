defmodule Trento.SapSystems.Commands.DeregisterSapSystem do
  @moduledoc """
  Deregister (decommission) a SapSystem instance from the monitoring system.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end

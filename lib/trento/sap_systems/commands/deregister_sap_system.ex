defmodule Trento.SapSystems.Commands.DeregisterSapSystem do
  @moduledoc """
  Deregister (decommission) a SAP System
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end

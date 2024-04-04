defmodule Trento.SapSystems.Commands.UpdateDatabaseHealth do
  @moduledoc """
  Update the health of the database associated to the SAP system.
  """

  @required_fields :all

  use Trento.Support.Command

  require Trento.Enums.Health, as: Health

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :database_health, Ecto.Enum, values: Health.values()
  end
end

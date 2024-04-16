defmodule Trento.SapSystems.Commands.RestoreSapSystem do
  @moduledoc """
  Restore a previously deregistered SapSystem.
  """

  @required_fields :all

  use Trento.Support.Command

  require Trento.Enums.Health, as: Health

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :db_host, :string
    field :tenant, :string
    field :database_health, Ecto.Enum, values: Health.values()
  end
end

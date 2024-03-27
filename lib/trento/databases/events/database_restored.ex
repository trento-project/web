defmodule Trento.Databases.Events.DatabaseRestored do
  @moduledoc """
  This event is emitted when a database is restored.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end

  def upcast(%{"sap_system_id" => sap_system_id} = params, _, 2) do
    params
    |> Map.put("database_id", sap_system_id)
    |> Map.drop(["sap_system_id"])
  end

  def upcast(params, _, 2), do: params
end

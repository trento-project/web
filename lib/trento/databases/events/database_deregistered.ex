defmodule Trento.Databases.Events.DatabaseDeregistered do
  @moduledoc """
  This event is emitted once all database instances belonging to a HANA database have been deregistered (decommissioned).
  """

  use Trento.Support.Event

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end

  def upcast(%{"sap_system_id" => sap_system_id} = params, _, 2) do
    params
    |> Map.put("database_id", sap_system_id)
    |> Map.drop(["sap_system_id"])
  end

  def upcast(params, _, 2), do: params
end

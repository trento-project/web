defmodule Trento.Databases.Events.DatabaseInstanceMarkedPresent do
  @moduledoc """
  This event is emitted when a database instance is marked as present.
  """

  use Trento.Support.Event

  defevent version: 2 do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
  end

  def upcast(%{"sap_system_id" => sap_system_id} = params, _, 2) do
    params
    |> Map.put("database_id", sap_system_id)
    |> Map.drop(["sap_system_id"])
  end

  def upcast(params, _, 2), do: params
end

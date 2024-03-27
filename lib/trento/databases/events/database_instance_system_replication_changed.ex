defmodule Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged do
  @moduledoc """
  This event is emitted when a database instance system replication has changed.
  """

  use Trento.Support.Event

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :system_replication, :string
    field :system_replication_status, :string
  end

  def upcast(%{"sap_system_id" => sap_system_id} = params, _, 2) do
    params
    |> Map.put("database_id", sap_system_id)
    |> Map.drop(["sap_system_id"])
  end

  def upcast(params, _, 2), do: params
end

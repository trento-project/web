defmodule Trento.Databases.Events.Upcaster.Upcast do
  @moduledoc """
  This module contains upcasting functions
  """

  @spec upcast_legacy_aggregate(map()) :: map()
  def upcast_legacy_aggregate(%{"sap_system_id" => sap_system_id} = params) do
    params
    |> Map.put("database_id", sap_system_id)
    |> Map.drop(["sap_system_id"])
  end

  def upcast_legacy_aggregate(params), do: params
end

defmodule Trento.Databases.Event.Upcaster.UpcastDatabaseId do
  @moduledoc """
  Adds the required upcast function to upcast from legacy events where
  sap_system_id was still used.
  """

  defmacro __using__(_opts) do
    quote do
      def upcast(%{"sap_system_id" => sap_system_id} = params, _, 2) do
        params
        |> Map.put("database_id", sap_system_id)
        |> Map.drop(["sap_system_id"])
      end

      def upcast(params, _, 2), do: params
    end
  end
end

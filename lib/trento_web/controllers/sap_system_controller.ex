defmodule TrentoWeb.SapSystemController do
  use TrentoWeb, :controller

  alias Trento.SapSystems

  alias Trento.Support.StructHelper

  ## TODO Fix sanitization
  def list(conn, _) do
    sap_systems =
      SapSystems.get_all_sap_systems()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, sap_systems)
  end

  def list_databases(conn, _) do
    databases =
      SapSystems.get_all_databases()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, databases)
  end
end

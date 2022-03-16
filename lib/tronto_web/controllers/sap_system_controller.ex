defmodule TrontoWeb.SapSystemController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring
  alias Tronto.Support.StructHelper

  def list(conn, _) do
    sap_systems =
      Monitoring.get_all_sap_systems()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, sap_systems)
  end

  def list_databases(conn, _) do
    databases =
      Monitoring.get_all_databases()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, databases)
  end
end

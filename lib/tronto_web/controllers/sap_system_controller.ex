defmodule TrontoWeb.SapSystemController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  def list(conn, _) do
    sap_systems = Monitoring.get_all_sap_systems()

    json(conn, sap_systems)
  end

  def list_databases(conn, _) do
    databases = Monitoring.get_all_databases()

    json(conn, databases)
  end
end

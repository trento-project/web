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

  def create_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Monitoring.Tags.create_tag(value, resource_id, "sap_system") do
      {:ok, _} ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, _, reason, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  def delete_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Monitoring.Tags.delete_tag(value, resource_id) do
      {0, _} ->
        conn
        |> put_status(:not_found)
        |> json(%{})

      {_affected, _} ->
        conn
        |> put_status(:accepted)
        |> json(%{})
    end
  end

  def list_databases(conn, _) do
    databases =
      Monitoring.get_all_databases()
      # TODO: fix me with DTOs
      |> StructHelper.to_map()

    json(conn, databases)
  end
end

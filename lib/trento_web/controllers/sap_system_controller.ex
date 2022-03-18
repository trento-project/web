defmodule TrentoWeb.SapSystemController do
  use TrentoWeb, :controller

  alias Trento.Monitoring
  alias Trento.Support.StructHelper

  ## TODO Fix sanitization
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

      {:error, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "tag creation failed"})
    end
  end

  @spec delete_tag(Plug.Conn.t(), map) :: Plug.Conn.t()
  def delete_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Monitoring.Tags.delete_tag(value, resource_id) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, _} = _ ->
        conn
        |> put_status(:not_found)
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

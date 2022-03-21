defmodule TrentoWeb.SapSystemController do
  use TrentoWeb, :controller

  alias Trento.{
    SapSystems,
    Tags
  }

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

  def create_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Tags.create_tag(value, resource_id, "sap_system") do
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
    case Tags.delete_tag(value, resource_id) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      :not_found ->
        conn
        |> put_status(:not_found)
        |> json(%{})
    end
  end
end

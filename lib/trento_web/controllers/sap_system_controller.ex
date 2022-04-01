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
        |> put_status(:created)
        |> json(%{value: value})

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
        send_resp(conn, :no_content, "")

      :not_found ->
        send_resp(conn, :not_found, "")
    end
  end

  # FIXME: refactor tags api, we just need a generic tag API
  def create_db_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Tags.create_tag(value, resource_id, "database") do
      {:ok, _} ->
        conn
        |> put_status(:created)
        |> json(%{value: value})

      {:error, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "tag creation failed"})
    end
  end
end

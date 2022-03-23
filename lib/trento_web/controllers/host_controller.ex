defmodule TrentoWeb.HostController do
  use TrentoWeb, :controller

  alias Trento.{
    Heartbeats,
    Hosts,
    Tags
  }

  alias Trento.Support.StructHelper

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()

  def list(conn, _) do
    # TODO: replace to_map with DTO approach
    hosts = Hosts.get_all_hosts() |> StructHelper.to_map()

    json(conn, hosts)
  end

  def heartbeat(conn, %{"id" => id}) do
    case Heartbeats.heartbeat(id) do
      {:ok, _} ->
        send_resp(conn, 204, "")

      {:error, _, reason, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec create_tag(Plug.Conn.t(), map) :: Plug.Conn.t()
  def create_tag(conn, %{
        "id" => id,
        "value" => value
      }) do
    case Tags.create_tag(value, id, "host") do
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
end

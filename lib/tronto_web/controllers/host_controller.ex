defmodule TrontoWeb.HostController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()

  def list(conn, _) do
    hosts = Monitoring.get_all_hosts()

    json(conn, hosts)
  end

  def heartbeat(conn, %{"id" => id}) do
    case Monitoring.Heartbeats.heartbeat(id) do
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

  def create_tag(conn, %{
        "id" => id,
        "value" => value
      }) do
    case Monitoring.Tags.create_tag(value, id, "host") do
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
      :ok ->
        conn
        |> put_status(:not_found)
        |> json(%{})

      :not_found ->
        conn
        |> put_status(:accepted)
        |> json(%{})
    end
  end
end

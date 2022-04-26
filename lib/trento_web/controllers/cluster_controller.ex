defmodule TrentoWeb.ClusterController do
  use TrentoWeb, :controller

  alias Trento.{Clusters, Hosts}

  alias Trento.Integration.Checks

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    json(conn, clusters)
  end

  @spec request_checks_execution(Plug.Conn.t(), map) :: Plug.Conn.t()
  def request_checks_execution(conn, %{"cluster_id" => cluster_id}) do
    case Clusters.request_checks_execution(cluster_id) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  def runner_callback(conn, params) do
    case Checks.handle_callback(params) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "runner callback failed"})
    end
  end

  @spec select_checks(Plug.Conn.t(), map) :: Plug.Conn.t()
  def select_checks(conn, %{"cluster_id" => cluster_id, "checks" => checks}) do
    case Clusters.select_checks(cluster_id, checks) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec get_connection_settings(Plug.Conn.t(), map) :: Plug.Conn.t()
  def get_connection_settings(conn, %{"cluster_id" => cluster_id}) do
    settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

    conn
    |> put_status(:ok)
    |> json(settings)
  end

  @spec save_connection_settings(Plug.Conn.t(), map) :: Plug.Conn.t()
  def save_connection_settings(
        conn,
        %{
          "settings" => [_ | _] = settings,
          "cluster_id" => cluster_id
        }
      ) do
    settings
    |> Enum.map(&map_to_struct/1)
    |> Hosts.save_hosts_connection_settings()

    get_connection_settings(conn, %{"cluster_id" => cluster_id})
  end

  defp map_to_struct(%{"host_id" => host_id, "user" => user}) do
    %{host_id: host_id, user: user}
  end
end

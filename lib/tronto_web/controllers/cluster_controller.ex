defmodule TrontoWeb.ClusterController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @json_path Path.join(File.cwd!(), "priv/data/catalog.json")
  @catalog @json_path |> File.read!() |> Jason.decode!()
  @external_resource @json_path

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    clusters = Monitoring.get_all_clusters()

    json(conn, clusters)
  end

  @spec store_checks_results(Plug.Conn.t(), map) :: Plug.Conn.t()
  def store_checks_results(
        conn,
        %{"cluster_id" => cluster_id, "hosts" => hosts, "checks" => checks}
      ) do
    [host_id] = Map.keys(hosts)

    checks_results =
      Enum.map(
        checks,
        fn {check_id, %{"hosts" => %{^host_id => %{"result" => result}}}} ->
          %{
            check_id: check_id,
            result: String.to_atom(result)
          }
        end
      )
      |> Enum.reject(fn %{result: result} ->
        result == :skipped
      end)

    case Monitoring.store_checks_results(cluster_id, host_id, checks_results) do
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

  @spec request_checks_execution(Plug.Conn.t(), map) :: Plug.Conn.t()
  def request_checks_execution(conn, %{"cluster_id" => cluster_id}) do
    case Monitoring.request_checks_execution(cluster_id) do
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

  @spec checks_catalog(Plug.Conn.t(), map) :: Plug.Conn.t()
  def checks_catalog(conn, _) do
    json(conn, @catalog)
  end

  @spec select_checks(Plug.Conn.t(), map) :: Plug.Conn.t()
  def select_checks(conn, %{"cluster_id" => cluster_id, "checks" => checks}) do
    case Monitoring.select_checks(cluster_id, checks) do
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
end

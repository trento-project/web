defmodule Trento.Infrastructure.ComponentVersions do
  @moduledoc """
  Fetches version information from all platform components.
  """

  @behaviour Trento.Infrastructure.ComponentVersions.Gen

  alias Ecto.Adapters.SQL

  require Logger

  @timeout 5_000

  @impl true
  def get_versions do
    fetchers = [
      {:postgres_version, &fetch_postgres_version/0},
      {:rabbitmq_version, &fetch_rabbitmq_version/0},
      {:prometheus_version, &fetch_prometheus_version/0},
      {:wanda_version, &fetch_wanda_version/0}
    ]

    results =
      fetchers
      |> Task.async_stream(
        fn {key, fetcher} ->
          {key, safe_fetch(key, fetcher)}
        end,
        timeout: @timeout,
        on_timeout: :kill_task
      )
      |> Enum.reduce(%{}, fn
        {:ok, {key, version}}, acc -> Map.put(acc, key, version)
        {:exit, _}, acc -> acc
      end)

    Map.merge(
      %{
        postgres_version: nil,
        rabbitmq_version: nil,
        prometheus_version: nil,
        wanda_version: nil
      },
      results
    )
  end

  defp safe_fetch(key, fetcher) do
    case fetcher.() do
      {:ok, version} -> version
      {:error, _} -> nil
    end
  rescue
    e ->
      Logger.error("Failed to fetch #{key}: #{inspect(e)}")
      nil
  catch
    kind, reason ->
      Logger.error("Failed to fetch #{key}: #{inspect(kind)} #{inspect(reason)}")
      nil
  end

  defp fetch_postgres_version do
    case SQL.query(Trento.Repo, "SHOW server_version", []) do
      {:ok, %{rows: [[version]]}} ->
        {:ok, version}

      {:error, reason} ->
        Logger.error("Failed to fetch PostgreSQL version: #{inspect(reason)}")
        {:error, :unreachable}
    end
  end

  defp fetch_rabbitmq_version do
    amqp_config =
      Application.fetch_env!(:trento, Trento.Infrastructure.Messaging.Adapter.AMQP)

    amqp_url = amqp_config[:checks][:consumer][:connection]

    case AMQP.Connection.open(amqp_url) do
      {:ok, %AMQP.Connection{pid: pid} = conn} ->
        version = extract_rabbitmq_version(pid)
        AMQP.Connection.close(conn)
        version

      {:error, reason} ->
        Logger.error("Failed to connect to RabbitMQ: #{inspect(reason)}")
        {:error, :unreachable}
    end
  end

  defp extract_rabbitmq_version(pid) do
    case :amqp_connection.info(pid, [:server_properties]) do
      [{:server_properties, props}] ->
        case List.keyfind(props, "version", 0) do
          {"version", :longstr, version} -> {:ok, to_string(version)}
          _ -> {:error, :version_not_found}
        end

      _ ->
        {:error, :version_not_found}
    end
  end

  defp fetch_prometheus_version do
    prometheus_url =
      Application.fetch_env!(:trento, Trento.Infrastructure.Prometheus.PrometheusApi)[:url]

    url = "#{prometheus_url}/api/v1/status/buildinfo"
    headers = [{"Accept", "application/json"}]

    case HTTPoison.get(url, headers, recv_timeout: @timeout) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, %{"data" => %{"version" => version}}} -> {:ok, version}
          _ -> {:error, :unexpected_response}
        end

      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        Logger.error("Unexpected Prometheus buildinfo response: #{status_code}")
        {:error, :unexpected_response}

      {:error, reason} ->
        Logger.error("Failed to fetch Prometheus version: #{inspect(reason)}")
        {:error, :unreachable}
    end
  end

  defp fetch_wanda_version do
    checks_base_url = Application.fetch_env!(:trento, :checks_service)[:base_url]

    case HTTPoison.get("#{checks_base_url}/api", [{"Accept", "application/json"}],
           recv_timeout: @timeout
         ) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, %{"version" => version}} -> {:ok, version}
          _ -> {:error, :unexpected_response}
        end

      {:error, reason} ->
        Logger.error("Failed to fetch Wanda version: #{inspect(reason)}")
        {:error, :unreachable}

      _ ->
        {:error, :unexpected_response}
    end
  end
end

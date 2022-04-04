defmodule Trento.Integration.Grafana do
  @moduledoc """
  Grafana integration service
  """

  require Logger

  @retries 10
  @retry_after 1_000

  @grafana_dashboards_path File.cwd!() <> "/priv/data/grafana/"

  def init_dashboards do
    dashboards = Application.fetch_env!(:trento, Trento.Integration.Grafana)[:dashboards]

    dashboards
    |> Enum.reduce_while(:ok, fn dashboard_name, _ ->
      case init_dashboard(dashboard_name) do
        :ok ->
          {:cont, :ok}

        error ->
          {:halt, error}
      end
    end)
  end

  def init_dashboard(dashboard_name) do
    case load_dashboard(dashboard_name) do
      {:ok, content} ->
        create_dashboard(content, @retries - 1)

      {:error, reason} = error ->
        Logger.error("Fail to load grafana dashboard #{dashboard_name}", error: reason)
        error
    end
  end

  defp create_dashboard(_, 0) do
    Logger.error("Failed to create grafana dashboard")
    {:error, :max_retries_reached}
  end

  defp create_dashboard(content, retry) do
    with {:ok, token} <- create_token(),
         :ok <- post_dashboard(content, token) do
      :ok
    else
      {:error, reason} ->
        Logger.error("Failed to created grafana dashboard, retrying...", error: inspect(reason))
        Process.sleep(@retry_after)
        create_dashboard(content, retry - 1)
    end
  end

  defp load_dashboard(name) do
    @grafana_dashboards_path
    |> Path.join("#{name}.json")
    |> File.read()
  end

  defp create_token do
    payload =
      Jason.encode!(%{
        "role" => "Admin",
        "name" => UUID.uuid4(),
        "secondsToLive" => 60
      })

    api_url = Application.fetch_env!(:trento, Trento.Integration.Grafana)[:api_url]
    user = Application.fetch_env!(:trento, Trento.Integration.Grafana)[:user]
    password = Application.fetch_env!(:trento, Trento.Integration.Grafana)[:password]
    credentials = Base.encode64("#{user}:#{password}")

    with {:ok, %HTTPoison.Response{body: body, status_code: 200}} <-
           HTTPoison.post(
             "#{api_url}/auth/keys",
             payload,
             [{"Content-type", "application/json"}, {"Authorization", "Basic #{credentials}"}]
           ),
         {:ok, %{"key" => token}} <- Jason.decode(body) do
      {:ok, token}
    else
      %HTTPoison.Response{body: body, status_code: status_code} ->
        Logger.error("Failed to create grafana token, status code: #{status_code}",
          body: inspect(body)
        )

        {:error, :failed_to_create_token}

      {:error, reason} ->
        Logger.error("Failed to create grafana token", error: inspect(reason))
        {:error, :failed_to_create_token}
    end
  end

  defp post_dashboard(content, token) do
    case HTTPoison.post(
           "http://localhost:3000/api/dashboards/db",
           content,
           [{"Content-type", "application/json"}, {"Authorization", "Bearer #{token}"}]
         ) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        :ok

      {:error, reason} ->
        Logger.error("Failed to create grafana dashboard", error: inspect(reason))
        {:error, :failed_to_create_dashboard}
    end
  end
end

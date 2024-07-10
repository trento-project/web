defmodule TrentoWeb.Plugs.ActivityLoggingPlug do
  @moduledoc """
  This plug is responsible for auditing the requests made to the API.
  """

  @behaviour Plug

  import Plug.Conn

  alias Trento.ActivityLog.Parser.ActivityParser
  alias Trento.ActivityLog.ActivityLog
  alias TrentoWeb.Plugs.LoadUserPlug
  alias Trento.Repo

  require Logger

  def init(default), do: default

  def call(%Plug.Conn{} = conn, _default \\ nil), do: register_before_send(conn, &log_activity/1)

  defp log_activity(conn) do
    Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
      conn
      |> load_user()
      |> ActivityParser.to_activity_log()
      |> write_log()
    end)

    conn
  end

  defp write_log(false), do: nil

  defp write_log({:error, reason}),
    do: Logger.error("An error occurred while logging. Reason: #{inspect(reason)}")

  defp write_log(%{type: activity_type} = entry) do
    case %ActivityLog{}
         |> ActivityLog.changeset(entry)
         |> Repo.insert() do
      {:ok, _} ->
        Logger.info("Logged activity: #{activity_type}")

      {:error, reason} ->
        Logger.error(
          "An error occurred while logging activity: #{activity_type}. Reason: #{inspect(reason)}"
        )
    end
  end

  defp load_user(conn) do
    LoadUserPlug.call(conn, nil)
  rescue
    Pow.Config.ConfigError ->
      conn
  end
end

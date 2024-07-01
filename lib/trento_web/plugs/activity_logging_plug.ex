defmodule TrentoWeb.Plugs.ActivityLoggingPlug do
  @moduledoc """
  This plug is responsible for auditing the requests made to the API.
  """

  @behaviour Plug

  import Plug.Conn

  alias Trento.ActivityLog.ActivityLogger
  alias TrentoWeb.Plugs.LoadUserPlug

  def init(default), do: default

  def call(%Plug.Conn{} = conn, _default \\ nil), do: register_before_send(conn, &log_activity/1)

  defp log_activity(conn) do
    Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
      conn
      |> load_user()
      |> ActivityLogger.log_activity()
    end)

    conn
  end

  defp load_user(conn) do
    LoadUserPlug.call(conn, nil)
  rescue
    Pow.Config.ConfigError ->
      conn
  end
end

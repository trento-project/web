defmodule TrentoWeb.Plugs.AuditingPlug do
  @moduledoc """
  This plug is responsible for auditing the requests made to the API.
  """

  @behaviour Plug

  # alias Phoenix.Controller

  import Plug.Conn

  def init(default), do: default

  def call(%Plug.Conn{} = conn, _default), do: register_before_send(conn, &audit_request/1)

  defp audit_request(conn) do
    Task.async(fn ->
      conn
      |> TrentoWeb.Plugs.LoadUserPlug.call(nil)
      |> Trento.Auditing.audit_request()
    end)

    conn
  rescue
    err ->
      IO.inspect(err, label: "error in auditing plug")
      conn
  end
end

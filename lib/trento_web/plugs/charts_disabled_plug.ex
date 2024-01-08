defmodule TrentoWeb.Plugs.ChartsDisabledPlug do
  @moduledoc """
    This plug will act as a barrier for the charts endpoint, will return 501 for all the requests.

    The endpoints will be accessible only if the ":trento, Trento.Charts, enabled" configuration entry is properly set.

    The plug itself is mounted only when the charts are disabled in the configuration.
  """
  @behaviour Plug

  alias TrentoWeb.ErrorView

  import Plug.Conn

  @impl true
  def init(opts), do: opts

  @impl true
  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, _) do
    conn
    |> put_status(501)
    |> resp(
      501,
      Jason.encode!(
        ErrorView.render("501.json", %{
          reason: "Charts endpoints are disabled, check the documentation for further details"
        })
      )
    )
    |> halt()
  end
end

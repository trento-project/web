defmodule TrentoWeb.Plugs.DisabledWithOidcPlug do
  @moduledoc """
    This plug acts as a barrier for endpoints, return 501 for an action, if the OIDC integration is enabled
  """
  @behaviour Plug

  alias TrentoWeb.ErrorView

  import Plug.Conn

  @impl true
  def init(opts) do
    oidc_enabled = Application.fetch_env!(:trento, :oidc)[:enabled]

    Keyword.put(otps, :oidc_enabled, oidc_enabled)
  end

  @impl true
  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, oidc_enabled: true) do
    conn
    |> put_resp_content_type("application/json")
    |> resp(
      501,
      Jason.encode!(
        ErrorView.render("501.json", %{
          reason:
            "The requested endpoint is disabled because OIDC integration is enabled, check the documentation for further details"
        })
      )
    )
    |> halt()
  end

  def call(conn, _), do: conn
end

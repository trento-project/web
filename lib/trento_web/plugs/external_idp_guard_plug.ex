defmodule TrentoWeb.Plugs.ExternalIdpGuardPlug do
  @moduledoc """
  This plug acts as a guard for certain actions/endpoint, to disable them when an external idp integration
  is enabled
  """
  @behaviour Plug

  alias TrentoWeb.ErrorView

  import Plug.Conn

  @impl true
  def init(opts) do
    Keyword.put(opts, :external_idp_enabled, oidc_enabled?())
  end

  @impl true
  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, external_idp_enabled: true) do
    conn
    |> put_resp_content_type("application/json")
    |> resp(
      501,
      Jason.encode!(
        ErrorView.render("501.json", %{
          reason:
            "Endpoint disabled, external idp enabled, check the documentation for further details"
        })
      )
    )
    |> halt()
  end

  def call(conn, _), do: conn

  defp oidc_enabled?, do: Application.fetch_env!(:trento, :oidc)[:enabled]
end

defmodule TrentoWeb.Plugs.ExternalIdpGuardPlug do
  @moduledoc """
  This plug acts as a guard for certain actions/endpoint to disable them when an external idp integration is enabled
  """
  @behaviour Plug

  alias TrentoWeb.ErrorJSON

  import Plug.Conn

  import Trento.Infrastructure.SSO.SSO, only: [sso_enabled?: 0]

  @impl true
  def init(opts) do
    Keyword.put(opts, :external_idp_enabled, sso_enabled?())
  end

  @impl true
  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, external_idp_enabled: true) do
    conn
    |> put_resp_content_type("application/json")
    |> resp(
      501,
      Jason.encode!(
        ErrorJSON.render("501.json", %{
          reason: "Endpoint disabled due an external IDP is enabled"
        })
      )
    )
    |> halt()
  end

  def call(conn, _), do: conn
end

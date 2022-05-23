defmodule TrentoWeb.SettingsController do
  use TrentoWeb, :controller

  alias Trento.Installation

  alias TrentoWeb.OpenApi.Schema

  use OpenApiSpex.ControllerSpecs

  operation :settings, false

  @spec settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def settings(conn, _) do
    conn
    |> json(%{
      eula_accepted: Installation.eula_accepted?(),
      premium_subscription: Installation.premium?()
    })
  end

  operation :accept_eula,
    summary: "Accept Eula",
    tags: ["Platform"],
    description: "Accepting EULA allows the end user to use the platform",
    responses: [
      ok:
        {"EULA acceptance has been correctly registered and the user may continue using the platform",
         "application/json", Schema.Common.EmptyResponse}
    ]

  @spec accept_eula(Plug.Conn.t(), any) :: Plug.Conn.t()
  def accept_eula(conn, _) do
    :ok = Installation.accept_eula()

    conn |> json(%{})
  end
end

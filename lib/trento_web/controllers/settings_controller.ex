defmodule TrentoWeb.SettingsController do
  use TrentoWeb, :controller

  alias Trento.Installation

  def settings(conn, _) do
    conn
    |> json(%{
      eula_accepted: Installation.eula_accepted?(),
      premium_subscription: Installation.premium?()
    })
  end

  def accept_eula(conn, _) do
    :ok = Installation.accept_eula()

    conn |> json(%{})
  end
end

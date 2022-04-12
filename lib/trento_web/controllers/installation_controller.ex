defmodule TrentoWeb.InstallationController do
  use TrentoWeb, :controller

  def get_api_key(conn, _) do
    key = Trento.Installation.get_api_key()

    conn
    |> put_status(:ok)
    |> json(%{"api_key" => key})
  end
end

defmodule TrentoWeb.AuthenticatedAPIErrorHandler do
  @moduledoc """
  Used to handle authentication error in APIs

  Can be attached to
  `Pow.Plug.RequireAuthenticated`, `TrentoWeb.AuthenticateAPIKeyPlug`
  and any other auth plug supporting an :error_handler
  """
  use TrentoWeb, :controller
  alias Plug.Conn

  @spec call(Conn.t(), :not_authenticated) :: Conn.t()
  def call(conn, :not_authenticated) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "Unauthorized"})
  end
end

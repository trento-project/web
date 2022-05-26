defmodule TrentoWeb.MockRunnerController do
  use TrentoWeb, :controller

  alias Trento.Integration.Checks.MockRunner

  @spec set_expected_results(Plug.Conn.t(), map) :: Plug.Conn.t()
  def set_expected_results(conn, %{"expected_results" => expected_results}) do
    MockRunner.set_expected_results(expected_results)

    conn
    |> put_status(:accepted)
    |> json(%{})
  end
end

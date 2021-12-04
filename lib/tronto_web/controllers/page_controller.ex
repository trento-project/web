defmodule TrontoWeb.PageController do
  use TrontoWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end

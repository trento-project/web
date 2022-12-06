defmodule TrentoWeb.AuthErrorHandler do
  use TrentoWeb, :controller

  def call(conn, :not_authenticated) do
    conn
    |> redirect(to: Routes.login_path(conn, :new))
  end

  def call(conn, :already_authenticated) do
    conn
    |> redirect(to: Routes.page_path(conn, :index, "/dashboard"))
  end
end

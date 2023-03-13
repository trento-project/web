defmodule TrentoWeb.FallbackController do
  use TrentoWeb, :controller

  alias TrentoWeb.ErrorView

  def call(conn, {:error, {:unprocessable_entity, error}}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", error: error)
  end

  def call(conn, {:error, {:internal_error, detail}}) do
    conn
    |> put_status(:internal_server_error)
    |> put_view(ErrorView)
    |> render(:"500", detail: detail)
  end

  def call(conn, {:error, {:not_found, detail}}) do
    conn
    |> put_status(:not_found)
    |> put_view(ErrorView)
    |> render(:"404", detail: detail)
  end

  def call(conn, {:error, {:unauthorized, detail}}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ErrorView)
    |> render(:"401", detail: detail)
  end
end

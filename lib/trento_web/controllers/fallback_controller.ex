defmodule TrentoWeb.FallbackController do
  use TrentoWeb, :controller

  alias TrentoWeb.ErrorView

  def call(conn, {:error, {:bad_request, errors = %{}}}) do
    conn
    |> put_status(:bad_request)
    |> render_errors(errors)
  end

  def call(conn, {:error, {:bad_request, reason}}) do
    conn
    |> put_status(:bad_request)
    |> render_error(reason)
  end

  def call(conn, {:error, {:unprocessable_entity, reason}}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render_error(reason)
  end

  def call(conn, {:error, {:internal_error, reason}}) do
    conn
    |> put_status(:internal_server_error)
    |> render_error(reason)
  end

  def call(conn, {:error, {:not_found, reason}}) do
    conn
    |> put_status(:not_found)
    |> render_error(reason)
  end

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(TrentoWeb.SessionView)
    |> render("invalid_credentials.json")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(TrentoWeb.SessionView)
    |> render("unauthorized.json")
  end

  defp render_error(conn, reason) do
    conn
    |> put_view(ErrorView)
    |> render("error.json", reason: reason)
  end

  defp render_errors(conn, errors) do
    conn
    |> put_view(ErrorView)
    |> render("errors.json", errors: errors)
  end
end

defmodule TrentoWeb.TagsController do
  use TrentoWeb, :controller

  alias Trento.Tags

  @spec add_tag(Plug.Conn.t(), map) :: Plug.Conn.t()
  def add_tag(
        %{assigns: %{resource_type: resource_type}} = conn,
        %{
          "id" => id,
          "value" => value
        }
      ) do
    case Tags.add_tag(value, id, resource_type) do
      {:ok, %Trento.Tag{value: value}} ->
        conn
        |> put_status(:created)
        |> json(%{value: value})

      {:error, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{errors: errors})
    end
  end

  @spec remove_tag(Plug.Conn.t(), map) :: Plug.Conn.t()
  def remove_tag(conn, %{
        "id" => resource_id,
        "value" => value
      }) do
    case Tags.delete_tag(value, resource_id) do
      :ok ->
        send_resp(conn, :no_content, "")

      :not_found ->
        send_resp(conn, :not_found, "")
    end
  end
end

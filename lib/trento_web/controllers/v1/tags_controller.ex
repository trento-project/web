defmodule TrentoWeb.V1.TagsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Tags

  alias TrentoWeb.OpenApi.Schema

  action_fallback TrentoWeb.FallbackController
  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  operation :add_tag,
    summary: "Add tag",
    tags: ["Tags"],
    description: "Add a tag to a resource.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body:
      {"Tag", "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string}
         }
       }},
    responses: [
      accepted: "The tag has been added to the resource",
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def add_tag(
        %{
          assigns: %{
            resource_type: resource_type
          }
        } = conn,
        %{id: id}
      ) do
    %{value: value} = Map.get(conn, :body_params)

    case Tags.add_tag(value, id, resource_type) do
      {:ok, %Trento.Tag{value: value}} ->
        conn
        |> put_status(:created)
        |> json(%{value: value})

      {:error, errors} ->
        {:error, {:unprocessable_entity, errors}}
    end
  end

  operation :remove_tag,
    summary: "Remove tag",
    tags: ["Tags"],
    description: "Remove a tag from a resource.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ],
      value: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      accepted: "The tag has been removed from the resource",
      bad_request: TrentoWeb.OpenApi.Schema.BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def remove_tag(conn, %{
        id: resource_id,
        value: value
      }) do
    case Tags.delete_tag(value, resource_id) do
      :ok ->
        send_resp(conn, :no_content, "")

      :not_found ->
        send_resp(conn, :not_found, "")
    end
  end
end

defmodule TrentoWeb.V1.TagsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Tags
  alias Trento.Tags.Tag

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.{NotFound, UnprocessableEntity}

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Tags.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  action_fallback TrentoWeb.FallbackController
  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true

  operation :add_tag,
    summary: "Add tag.",
    tags: ["Tags"],
    description:
      "Adds a new tag to the specified resource, supporting resource categorization and management for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the resource to which the tag will be added. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body:
      {"Request containing tag value to be added to the specified resource for resource categorization and management.",
       "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        "Tag has been successfully added to the specified resource, supporting resource categorization and management.",
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def add_tag(
        %{
          assigns: %{
            resource_type: resource_type
          }
        } = conn,
        %{id: id}
      ) do
    %{value: value} = OpenApiSpex.body_params(conn)

    with {:ok, %Tag{value: value}} <- Tags.add_tag(value, id, resource_type) do
      conn
      |> put_status(:created)
      |> json(%{value: value})
    end
  end

  operation :remove_tag,
    summary: "Remove tag from resource.",
    tags: ["Tags"],
    description:
      "Removes a tag from the specified resource, supporting resource management and cleanup for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the resource from which the tag will be removed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      value: [
        in: :path,
        description: "The value of the tag to be removed from the resource.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "production"
        }
      ]
    ],
    responses: [
      no_content: "The tag has been removed from the resource.",
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response(),
      not_found: NotFound.response()
    ]

  def remove_tag(conn, %{
        id: resource_id,
        value: value
      }) do
    with :ok <- Tags.delete_tag(value, resource_id) do
      send_resp(conn, :no_content, "")
    end
  end

  def get_policy_resource(%{
        assigns: %{
          resource_type: resource_type
        }
      }),
      do: %{tag_resource: resource_type, resource: Tag}
end

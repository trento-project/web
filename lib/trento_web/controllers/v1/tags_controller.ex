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

  operation :add_tag_to_host,
    summary: "Add tag to host.",
    tags: ["Tags"],
    description:
      "Adds a new tag to the specified host, supporting resource categorization and management for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host to which the tag will be added. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body:
      {"Request containing tag value to be added to the specified host for resource categorization and management.",
       "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"Tag has been successfully added to the specified host, supporting resource categorization and management.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  operation :add_tag_to_cluster,
    summary: "Add tag to cluster.",
    tags: ["Tags"],
    description:
      "Adds a new tag to the specified cluster, supporting resource categorization and management for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the cluster to which the tag will be added. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    request_body:
      {"Request containing tag value to be added to the specified cluster for resource categorization and management.",
       "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         example: %{
           value: "production"
         },
         properties: %{
           value: %OpenApiSpex.Schema{
             type: :string,
             example: "production"
           }
         }
       }},
    responses: [
      created:
        {"Tag has been successfully added to the specified cluster, supporting resource categorization and management.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  operation :add_tag_to_sap_system,
    summary: "Add tag to SAP system.",
    tags: ["Tags"],
    description:
      "Adds a new tag to the specified SAP system, supporting resource categorization and management for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the SAP system to which the tag will be added. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body:
      {"Request containing tag value to be added to the specified SAP system for resource categorization and management.",
       "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"Tag has been successfully added to the specified SAP system, supporting resource categorization and management.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response()
    ]

  operation :add_tag_to_database,
    summary: "Add tag to database.",
    tags: ["Tags"],
    description:
      "Adds a new tag to the specified database, supporting resource categorization and management for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the database to which the tag will be added. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    request_body:
      {"Request containing tag value to be added to the specified database for resource categorization and management.",
       "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"Tag has been successfully added to the specified database, supporting resource categorization and management.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
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

  def add_tag_to_host(conn, params), do: add_tag(conn, params)
  def add_tag_to_cluster(conn, params), do: add_tag(conn, params)
  def add_tag_to_sap_system(conn, params), do: add_tag(conn, params)
  def add_tag_to_database(conn, params), do: add_tag(conn, params)

  operation :remove_tag_from_host,
    summary: "Remove tag from host.",
    tags: ["Tags"],
    description:
      "Removes a tag from the specified host, supporting resource management and cleanup for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the host from which the tag will be removed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      value: [
        in: :path,
        description: "The value of the tag to be removed from the host.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "production"
        }
      ]
    ],
    responses: [
      no_content:
        {"The tag has been removed from the host.", "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response(),
      not_found: NotFound.response()
    ]

  operation :remove_tag_from_cluster,
    summary: "Remove tag from cluster.",
    tags: ["Tags"],
    description:
      "Removes a tag from the specified cluster, supporting resource management and cleanup for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the cluster from which the tag will be removed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      value: [
        in: :path,
        description: "The value of the tag to be removed from the cluster.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "production"
        }
      ]
    ],
    responses: [
      no_content:
        {"The tag has been removed from the cluster.", "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response(),
      not_found: NotFound.response()
    ]

  operation :remove_tag_from_sap_system,
    summary: "Remove tag from SAP system.",
    tags: ["Tags"],
    description:
      "Removes a tag from the specified SAP system, supporting resource management and cleanup for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the SAP system from which the tag will be removed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      value: [
        in: :path,
        description: "The value of the tag to be removed from the SAP system.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "production"
        }
      ]
    ],
    responses: [
      no_content: "The tag has been removed from the SAP system.",
      bad_request: Schema.BadRequest.response(),
      unprocessable_entity: UnprocessableEntity.response(),
      not_found: NotFound.response()
    ]

  operation :remove_tag_from_database,
    summary: "Remove tag from database.",
    tags: ["Tags"],
    description:
      "Removes a tag from the specified database, supporting resource management and cleanup for infrastructure operations.",
    parameters: [
      id: [
        in: :path,
        description:
          "Unique identifier of the database from which the tag will be removed. This value must be a valid UUID string.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      value: [
        in: :path,
        description: "The value of the tag to be removed from the database.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "production"
        }
      ]
    ],
    responses: [
      no_content: "The tag has been removed from the database.",
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

  def remove_tag_from_host(conn, params), do: remove_tag(conn, params)
  def remove_tag_from_cluster(conn, params), do: remove_tag(conn, params)
  def remove_tag_from_sap_system(conn, params), do: remove_tag(conn, params)
  def remove_tag_from_database(conn, params), do: remove_tag(conn, params)

  def get_policy_resource(%{
        assigns: %{
          resource_type: resource_type
        }
      }),
      do: %{tag_resource: resource_type, resource: Tag}
end

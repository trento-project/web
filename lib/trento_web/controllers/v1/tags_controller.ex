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
    description: "Add a tag to a host.",
    parameters: [
      id: [
        in: :path,
        description: "Host identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body:
      {"Tag.", "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"The tag has been added to the host.", "application/json",
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
    description: "Add a tag to a cluster.",
    parameters: [
      id: [
        in: :path,
        description: "Cluster identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    request_body:
      {"Tag.", "application/json",
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
        {"The tag has been added to the cluster.", "application/json",
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
    description: "Add a tag to a SAP system.",
    parameters: [
      id: [
        in: :path,
        description: "SAP system identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ]
    ],
    request_body:
      {"Tag.", "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"The tag has been added to the SAP system.", "application/json",
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
    description: "Add a tag to a database.",
    parameters: [
      id: [
        in: :path,
        description: "Database identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ]
    ],
    request_body:
      {"Tag.", "application/json",
       %OpenApiSpex.Schema{
         type: :object,
         properties: %{
           value: %OpenApiSpex.Schema{type: :string, example: "production"}
         }
       }},
    responses: [
      created:
        {"The tag has been added to the database.", "application/json",
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
    description: "Remove a tag from a host.",
    parameters: [
      id: [
        in: :path,
        description: "Host identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      value: [
        in: :path,
        description: "Tag value to remove.",
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
    description: "Remove a tag from a cluster.",
    parameters: [
      id: [
        in: :path,
        description: "Cluster identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      value: [
        in: :path,
        description: "Tag value to remove.",
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
    description: "Remove a tag from a SAP system.",
    parameters: [
      id: [
        in: :path,
        description: "SAP system identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
        }
      ],
      value: [
        in: :path,
        description: "Tag value to remove.",
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
    description: "Remove a tag from a database.",
    parameters: [
      id: [
        in: :path,
        description: "Database identifier.",
        required: true,
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          example: "d1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      value: [
        in: :path,
        description: "Tag value to remove.",
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

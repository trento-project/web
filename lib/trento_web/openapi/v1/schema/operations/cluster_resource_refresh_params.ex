defmodule TrentoWeb.OpenApi.V1.Schema.Operations.ClusterResourceRefreshParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "ClusterResourceRefreshParamsV1",
      description:
        "Represents the parameters for refreshing cluster resources, including specific resources and resources in nodes.",
      example: %{
        resource_id: "resource_1"
      },
      oneOf: [
        %Schema{
          description: "Refresh all resources.",
          type: :object,
          additionalProperties: false,
          example: %{}
        },
        %Schema{
          description: "Refresh a resource.",
          type: :object,
          additionalProperties: false,
          properties: %{
            resource_id: %Schema{
              type: :string,
              description: "Unique identifier of the cluster resource to refresh."
            }
          },
          required: [:resource_id],
          example: %{
            resource_id: "resource_1"
          }
        },
        %Schema{
          description: "Refresh a resource in a node.",
          type: :object,
          additionalProperties: false,
          properties: %{
            resource_id: %Schema{
              type: :string,
              description: "Unique identifier of the cluster resource to refresh."
            },
            node_id: %Schema{
              type: :string,
              description:
                "Unique identifier of the cluster node where the resource with resource_id to refresh."
            }
          },
          required: [:resource_id, :node_id],
          example: %{
            resource_id: "resource_1",
            node_id: "node_1"
          }
        }
      ]
    },
    struct?: false
  )
end

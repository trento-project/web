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
          title: "RefreshAll",
          description: "Refresh all resources.",
          type: :object,
          additionalProperties: false
        },
        %Schema{
          title: "RefreshResource",
          description: "Refresh a resource.",
          type: :object,
          additionalProperties: false,
          properties: %{
            resource_id: %Schema{
              type: :string,
              description: "Unique identifier of the cluster resource to refresh."
            }
          },
          required: [:resource_id]
        },
        %Schema{
          title: "RefreshResourceInNode",
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
          required: [:resource_id, :node_id]
        }
      ]
    },
    struct?: false
  )
end

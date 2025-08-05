defmodule TrentoWeb.OpenApi.V1.Schema.ClusterOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ClusterMaintenanceChangeParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ClusterMaintenanceChangeParams",
        description:
          "Represents the parameters for changing cluster maintenance state, including logic for resource and node prioritization. If neither resource_id nor node_id are provided, the entire cluster maintenance state is changed. Resource_id takes precedence over node_id.",
        type: :object,
        additionalProperties: false,
        example: %{
          maintenance: true,
          resource_id: "resource_1",
          node_id: "node_1"
        },
        properties: %{
          maintenance: %Schema{
            type: :boolean,
            description:
              "Indicates the desired maintenance state to apply to the cluster, node, or resource, supporting operational management."
          },
          resource_id: %Schema{
            type: :string,
            description:
              "Unique identifier of the cluster resource whose maintenance state should be changed, supporting targeted operations."
          },
          node_id: %Schema{
            type: :string,
            description:
              "Unique identifier of the cluster node whose maintenance state should be changed, supporting targeted operations."
          }
        },
        required: [:maintenance]
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "ClusterOperationParams",
      description:
        "Represents the parameters for a cluster operation request, including maintenance changes for resources or nodes.",
      type: :object,
      oneOf: [
        ClusterMaintenanceChangeParams
      ],
      example: %{
        maintenance: true,
        resource_id: "resource_1",
        node_id: "node_1"
      }
    },
    struct?: false
  )
end

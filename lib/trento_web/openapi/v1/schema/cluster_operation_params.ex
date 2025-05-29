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
          "Cluster maintenance change operation params. " <>
            "If neither resource_id nor node_id are given the complete cluster maintenance state is changed. " <>
            "resource_id has precedence over node_id",
        type: :object,
        additionalProperties: false,
        properties: %{
          maintenance: %Schema{
            type: :boolean,
            description: "Maintenance state to put the cluster/node/resource"
          },
          resource_id: %Schema{
            type: :string,
            description: "ID of the cluster resource to change the maintenance state"
          },
          node_id: %Schema{
            type: :string,
            description: "ID of the cluster node to change the maintenance state"
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
      description: "Cluster operation request parameters",
      oneOf: [
        ClusterMaintenanceChangeParams
      ]
    },
    struct?: false
  )
end

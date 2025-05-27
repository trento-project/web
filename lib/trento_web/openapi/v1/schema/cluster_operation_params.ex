defmodule TrentoWeb.OpenApi.V1.Schema.ClusterOperationParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ClusterMaintenanceChangeParams do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ClusterMaintenanceChangeParams",
        description: "Cluster maintenance change operation params",
        type: :object,
        additionalProperties: false,
        properties: %{
          maintenance: %Schema{type: :boolean},
          resource_id: %Schema{type: :string},
          node_id: %Schema{type: :string}
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

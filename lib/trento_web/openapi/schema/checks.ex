defmodule TrentoWeb.OpenApi.Schema.Checks do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule HostChecksExecution do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HostChecksExecution",
      description:
        "Representation of the current check execution on a specific host of a Cluster",
      type: :object,
      properties: %{
        cluster_id: %Schema{
          type: :string,
          description: "Cluster's ID",
          format: :uuid
        },
        host_id: %Schema{
          type: :string,
          description: "Host's ID",
          format: :uuid
        },
        reachable: %Schema{
          type: :boolean,
          description:
            "Indicates whether the host was reachable during the connection to run selected checks"
        },
        msg: %Schema{
          type: :string,
          description: "A message"
        }
      }
    })
  end

  defmodule CheckResult do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "CheckResult",
      description: "Representation of the result of a spectific check on a host of a cluster",
      type: :object,
      properties: %{
        cluster_id: %Schema{
          type: :string,
          description: "Cluster's ID",
          format: :uuid
        },
        host_id: %Schema{
          type: :string,
          description: "Host's ID",
          format: :uuid
        },
        check_id: %Schema{
          type: :string,
          description: "The identifier of the executed check"
        },
        result: %Schema{
          type: :string,
          description: "Host's last heartbeat status",
          enum: [:passing, :warning, :critical, :skipped, :unknown]
        },
        inserted_at: %Schema{
          type: :string,
          description: "Creation timestamp",
          format: :"date-time"
        },
        updated_at: %Schema{type: :string, description: "Update timestamp", format: :"date-time"}
      }
    })
  end

  defmodule ChecksSelectionRequest do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChecksSelectionRequest",
      description:
        "A list of desired checks that should be executed on the target infrastructure",
      type: :object,
      properties: %{
        checks: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      }
    })
  end
end

defmodule TrentoWeb.OpenApi.Schema.Runner do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ResourceIdentifier do
    @moduledoc false

    OpenApiSpex.schema(%{
      type: :string,
      format: :uuid
    })
  end

  defmodule ExecutionStarted do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ExecutionStarted",
      description:
        "The execution of the Check Selection started on the target infrastructure, for a specific Cluster",
      type: :object,
      properties: %{
        cluster_id: ResourceIdentifier
      }
    })
  end

  defmodule ExecutionCompleted do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ExecutionCompleted",
      description:
        "The execution of the Check Selection completed on the target infrastructure, for a specific Cluster",
      type: :object,
      properties: %{
        cluster_id: ResourceIdentifier,
        hosts: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              host_id: ResourceIdentifier,
              reachable: %Schema{type: :boolean},
              msg: %Schema{type: :string},
              results: %Schema{
                type: :array,
                items: %Schema{
                  type: :object,
                  properties: %{
                    check_id: %Schema{type: :string},
                    result: %Schema{
                      type: :string,
                      description: "The Result of the Check",
                      enum: [:passing, :warning, :critical, :skipped]
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  end

  defmodule CallbackEvent do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "CallbackEvent",
      description:
        "Represents a progress update sent during Checks Execution to notify the system",
      type: :object,
      properties: %{
        event: %Schema{type: :string, enum: [:execution_started, :execution_completed]},
        execution_id: %Schema{
          type: :string,
          format: :uuid,
          description:
            "The identifier of an execution. It has been provided on exectution request."
        },
        payload: %Schema{
          oneOf: [
            ExecutionStarted,
            ExecutionCompleted
          ]
        }
      },
      example: %{
        event: "execution_completed",
        execution_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        payload: %{
          cluster_id: "146a4e9f-9cdb-466e-9601-9af94b8b4f65",
          hosts: [
            %{
              host_id: "ae44943b-d866-4878-88c9-b4d49006460d",
              reachable: true,
              msg: "Some message",
              results: [
                %{
                  check_id: "ACH3CK1D",
                  result: :passing
                }
              ]
            }
          ]
        }
      }
    })
  end
end

defmodule TrentoWeb.OpenApi.V1.Schema.HttpStd do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Target do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HttpStd",
        type: :object,
        example: %{
          "targets" => ["myhost.de"],
          "labels" => %{
            "labelname" => "mylabel"
          }
        },
        additionalProperties: false,
        properties: %{
          labels: %Schema{
            type: :object,
            description: "String valued labels",
            additionalProperties: %Schema{type: :string}
          },
          targets: %Schema{
            type: :array,
            description: "List of targets",
            items: %Schema{
              title: "Targets",
              anyOf: [
                %Schema{
                  title: "IPv6",
                  type: :string,
                  format: :ipv6
                },
                %Schema{
                  title: "IPv4",
                  type: :string,
                  format: :ipv4
                },
                %Schema{
                  title: "Hostname",
                  type: :string,
                  format: :hostname
                }
              ]
            }
          }
        }
      },
      struct?: false
    )
  end

  defmodule TargetList do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HttpSTDTargetList",
        description: "Http discovery target list",
        type: :array,
        items: Target
      },
      struct?: false
    )
  end
end

defmodule TrentoWeb.OpenApi.V1.Schema.HttpStd do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Target do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HttpStd",
        description:
          "Represents the configuration for HTTP service discovery targets, including endpoints and associated labels for monitoring and management.",
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
            description:
              "A set of labels with string values, used for categorizing and identifying service discovery targets.",
            additionalProperties: %Schema{type: :string}
          },
          targets: %Schema{
            type: :array,
            description:
              "A list containing all target endpoints for HTTP service discovery, supporting network monitoring and management.",
            items: %Schema{
              description:
                "Represents a target endpoint for service discovery, which may be a hostname, IPv4, or IPv6 address, supporting connectivity and identification.",
              anyOf: [
                %Schema{
                  title: "IPv6",
                  description:
                    "Represents the format of an IPv6 address, supporting modern network identification and communication.",
                  type: :string,
                  format: :ipv6,
                  example: "2001:db8::1"
                },
                %Schema{
                  title: "IPv4",
                  description:
                    "Represents the format of an IPv4 address, used for network identification and communication.",
                  type: :string,
                  format: :ipv4,
                  example: "192.168.1.100"
                },
                %Schema{
                  description:
                    "Represents the format of a hostname, supporting network identification and service discovery.",
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
        description:
          "A list containing all HTTP service discovery targets, supporting network monitoring and management.",
        type: :array,
        items: Target,
        example: [
          %{
            "targets" => ["myhost.de", "10.1.1.5"],
            "labels" => %{
              "environment" => "production",
              "service" => "web"
            }
          }
        ]
      },
      struct?: false
    )
  end
end

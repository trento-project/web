defmodule TrentoWeb.OpenApi.V1.Schema.HttpStd do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Target do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HttpStd",
        description: "HTTP service discovery target configuration.",
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
            description: "String valued labels.",
            additionalProperties: %Schema{type: :string}
          },
          targets: %Schema{
            type: :array,
            description: "List of targets.",
            items: %Schema{
              description: "Target endpoint (hostname, IPv4, or IPv6 address).",
              anyOf: [
                %Schema{
                  title: "IPv6",
                  description: "IPv6 address format.",
                  type: :string,
                  format: :ipv6,
                  example: "2001:db8::1"
                },
                %Schema{
                  title: "IPv4",
                  description: "IPv4 address format.",
                  type: :string,
                  format: :ipv4,
                  example: "192.168.1.100"
                },
                %Schema{
                  description: "Hostname format.",
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
        description: "Http discovery target list.",
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

defmodule TrentoWeb.OpenApi.Schema.Host do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule IPv4 do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "IPv4",
      type: :string,
      format: :ipv4
    })
  end

  defmodule IPv6 do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "IPv6",
      type: :string,
      format: :ipv6
    })
  end

  defmodule Item do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Host",
      description: "A discovered host on the target infrastructure",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Host ID"},
        # pattern: ~r/[a-zA-Z][a-zA-Z0-9_]+/
        hostname: %Schema{type: :string, description: "Host name"},
        ip_addresses: %Schema{
          type: :array,
          description: "IP addresses",
          items: %Schema{
            title: "IP address",
            oneOf: [
              IPv4,
              IPv6
            ]
          }
        },
        ssh_address: TrentoWeb.OpenApi.Schema.Host.IPv4,
        agent_version: %Schema{
          type: :string,
          description: "Version of the agent installed on the host"
        },
        cluster_id: %Schema{
          type: :string,
          description: "Identifier of the cluster this host is part of",
          format: :uuid
        },
        heartbeat: %Schema{
          type: :string,
          description: "Host's last heartbeat status",
          enum: [:critical, :passing, :unknown]
        },
        provider: %Schema{
          type: :string,
          description: "Detected Provider on which the host is running",
          enum: [:azure, :aws, :gcp, :unknown]
        },
        provider_data: TrentoWeb.OpenApi.Schema.Provider.ProviderData,
        tags: %Schema{
          title: "Tags",
          description: "A list of tags attached to a resource",
          type: :array,
          items: TrentoWeb.OpenApi.Schema.Tag
        },
        sles_subscriptions: %Schema{
          title: "SlesSubscriptions",
          description: "A list of the available SLES Subscriptions on a host",
          type: :array,
          items: TrentoWeb.OpenApi.Schema.SlesSubscription
        }
      }
      # required: [:name, :email],
    })
  end

  defmodule Collection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HostsCollection",
      description: "A list of the discovered hosts",
      type: :array,
      items: Item
    })
  end
end

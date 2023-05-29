defmodule TrentoWeb.OpenApi.V1.Schema.Host do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Provider, SlesSubscription, Tags}

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

  defmodule HostItem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Host",
      description: "A discovered host on the target infrastructure",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Host ID", format: :uuid},
        hostname: %Schema{type: :string, description: "Host name"},
        ip_addresses: %Schema{
          type: :array,
          description: "IP addresses",
          items: %Schema{
            title: "IPAddress",
            anyOf: [
              IPv4,
              IPv6
            ]
          }
        },
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
        provider: Provider.SupportedProviders,
        provider_data: Provider.ProviderData,
        tags: Tags,
        sles_subscriptions: %Schema{
          title: "SlesSubscriptions",
          description: "A list of the available SLES Subscriptions on a host",
          type: :array,
          items: SlesSubscription
        },
        deregistered_at: %Schema{
          title: "DeregisteredAt",
          description: "Timestamp of the last deregistration of the host",
          type: :string,
          nullable: true,
          format: :"date-time"
        },
        heartbeat_timestamp: %Schema{
          title: "HeartbeatTimestamp",
          description: "Timestamp of the last heartbeat received from the host",
          type: :object,
          nullable: true,
          properties: %{
            agent_id: %Schema{type: :string, description: "Host ID", format: :uuid},
            timestamp: %Schema{type: :string, format: :"date-time"}
          }
        }
      }
    })
  end

  defmodule HostsCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HostsCollection",
      description: "A list of the discovered hosts",
      type: :array,
      items: HostItem
    })
  end
end

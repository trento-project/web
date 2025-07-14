defmodule TrentoWeb.OpenApi.V1.Schema.Host do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias TrentoWeb.OpenApi.V1.Schema.{
    HostArchitecture,
    Provider,
    ResourceHealth,
    SaptuneStatus,
    SlesSubscription,
    Tags
  }

  defmodule IPv4 do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "IPv4",
        type: :string,
        format: :ipv4
      },
      struct?: false
    )
  end

  defmodule IPv6 do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "IPv6",
        type: :string,
        format: :ipv6
      },
      struct?: false
    )
  end

  defmodule SystemdUnit do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SystemdUnit",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "Name of the systemd unit"},
          unit_file_state: %Schema{
            type: :string,
            description: "State of the systemd unit. Whether it is enabled or disabled"
          }
        }
      },
      struct?: false
    )
  end

  defmodule HostItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Host",
        description: "A discovered host on the target infrastructure",
        type: :object,
        additionalProperties: false,
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
          netmasks: %Schema{
            type: :array,
            description:
              "Netmasks associated to the ip_addresses field. The position of the item is associated to the ip address position in ip_addresses",
            items: %Schema{type: :integer, nullable: true}
          },
          agent_version: %Schema{
            type: :string,
            description: "Version of the agent installed on the host"
          },
          systemd_units: %Schema{
            title: "SystemdUnits",
            description: "A list of systemd units on the host",
            type: :array,
            items: SystemdUnit
          },
          arch: HostArchitecture,
          health: ResourceHealth,
          cluster_id: %Schema{
            type: :string,
            description: "Identifier of the cluster this host is part of",
            format: :uuid,
            nullable: true
          },
          cluster_host_status: %Schema{
            type: :string,
            description: "Status of host in the cluster is part of",
            enum: ClusterHostStatus.values(),
            nullable: true
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
          selected_checks: %Schema{
            title: "SelectedChecks",
            description: "A list of check ids selected for an execution on this host",
            type: :array,
            items: %Schema{type: :string}
          },
          saptune_status: SaptuneStatus,
          deregistered_at: %Schema{
            title: "DeregisteredAt",
            description: "Timestamp of the last deregistration of the host",
            type: :string,
            nullable: true,
            format: :"date-time"
          },
          last_heartbeat_timestamp: %Schema{
            title: "LastHeartbeatTimestamp",
            description: "Timestamp of the last heartbeat received from the host",
            type: :string,
            nullable: true,
            format: :"date-time"
          },
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        }
      },
      struct?: false
    )
  end

  defmodule HostsCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HostsCollection",
        description: "A list of the discovered hosts",
        type: :array,
        items: HostItem
      },
      struct?: false
    )
  end
end
